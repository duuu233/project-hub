#!/usr/bin/env node
// Zero-dependency reader for this repository's mapping-only YAML configuration.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function readConfig(file) {
  const root = Object.create(null), stack = [{ indent: -2, value: root }];
  for (const [index, line] of fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).entries()) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = /^( *)([\w.-]+):(?:\s+(.*))?$/.exec(line);
    if (!match || match[1].length % 2) throw new Error(`${file}:${index + 1}: only two-space YAML mappings are supported`);
    const [, spaces, key, raw] = match;
    while (stack.at(-1).indent >= spaces.length) stack.pop();
    if (spaces.length !== stack.at(-1).indent + 2) throw new Error(`Invalid indentation: ${file}:${index + 1}`);
    const parent = stack.at(-1).value;
    if (Object.hasOwn(parent, key)) throw new Error(`Duplicate key: ${key}`);
    let value;
    if (!raw || raw === '{}') value = Object.create(null);
    else if (raw === 'true' || raw === 'false') value = raw === 'true';
    else if (/^\d+$/.test(raw)) value = Number(raw);
    else if (raw.startsWith('"')) value = JSON.parse(raw);
    else if (raw.startsWith("'")) {
      if (!raw.endsWith("'")) throw new Error(`Unclosed quote: ${key}`);
      value = raw.slice(1, -1).replace(/''/g, "'");
    } else {
      if (/^[\[\]&*!>|{]/.test(raw) || /\s#/.test(raw)) throw new Error(`Unsupported YAML scalar: ${key}`);
      value = raw;
    }
    parent[key] = value;
    if (!raw) stack.push({ indent: spaces.length, value });
  }
  return root;
}

function inside(root, target) {
  const relative = path.relative(root, target);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
    throw new Error(`Path escapes intended directory: ${target}`);
  return target;
}
function entry(file) { try { return fs.lstatSync(file); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
function git(repo, ...args) { return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
function safeParents(root, target) {
  inside(root, target);
  let current = path.dirname(target);
  while (current !== root) {
    if (entry(current)?.isSymbolicLink()) throw new Error(`Symlink parent is not allowed: ${current}`);
    current = path.dirname(current);
  }
}
function snapshot(root) {
  const result = [];
  function visit(file, name) {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Nested links require manual migration: ${file}`);
    if (stat.isDirectory()) {
      result.push([name, 'directory']);
      for (const child of fs.readdirSync(file).sort()) visit(path.join(file, child), `${name}/${child}`);
    } else if (stat.isFile()) result.push([name, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]);
    else throw new Error(`Unsupported special file: ${file}`);
  }
  visit(root, '.');
  return JSON.stringify(result);
}
function link(target, source, type) {
  try { fs.symlinkSync(target, source, process.platform === 'win32' && type === 'directory' ? 'junction' : type === 'directory' ? 'dir' : 'file'); }
  catch (e) { throw new Error(`Cannot create link ${source}: ${e.message}. Windows file symlinks need Developer Mode or an elevated terminal.`); }
}

function resolveProjectPaths(hub, env, project, config, local) {
  const definition = config.projects?.[project], mapping = local.paths?.[project];
  if (!definition?.enabled || !mapping || mapping.transport !== 'local')
    throw new Error('Project is disabled/unmapped, or remote transport: run this command inside the mapped SSH host with its local Hub clone');
  let location = mapping.path.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => {
    if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
    return process.env[name];
  });
  if (location.startsWith('~/')) location = path.join(os.homedir(), location.slice(2));
  if (process.platform !== 'win32' && /^[A-Za-z]:[\\/]/.test(location)) throw new Error('Windows path cannot be mounted on this OS');
  const repo = fs.realpathSync(path.resolve(hub, location));
  if (fs.realpathSync(git(repo, 'rev-parse', '--show-toplevel')) !== repo) throw new Error('Mapped path must be the Git repository root');
  const privateRoot = path.join(hub, 'private', project);
  safeParents(hub, path.join(privateRoot, '.probe'));
  return { definition, mapping, repo, privateRoot };
}

export function setupProject({ hub, env, project, config, local, migrate = false, dryRun = false }) {
  const { definition, repo, privateRoot } = resolveProjectPaths(hub, env, project, config, local);
  const mounts = Object.entries(definition.private_mounts || {});
  if (!mounts.length) throw new Error('No private_mounts configured');
  const plans = mounts.map(([name, mount]) => {
    if (!/^[\w.-]+$/.test(name) || ['.', '..', '.git'].includes(name)) throw new Error(`Invalid mount name: ${name}`);
    if (!['directory', 'file'].includes(mount.type) || typeof mount.target !== 'string' || mount.target.includes('\\') || mount.target.split('/').some(p => !p || p === '.' || p === '..') || path.isAbsolute(mount.target)) throw new Error(`Invalid mount configuration: ${name}`);
    const source = inside(repo, path.join(repo, name)), target = inside(privateRoot, path.resolve(privateRoot, mount.target));
    safeParents(hub, target);
    if (git(repo, 'ls-files', '--', name)) throw new Error(`Team Git tracks ${name}; refusing migration`);
    const current = entry(source), destination = entry(target);
    if (destination?.isSymbolicLink()) throw new Error(`Private target must be real: ${target}`);
    if (destination && (mount.type === 'directory' ? !destination.isDirectory() : !destination.isFile())) throw new Error(`Target type mismatch: ${target}`);
    if (current?.isSymbolicLink()) {
      if (!destination || fs.realpathSync(source) !== fs.realpathSync(target)) throw new Error(`Wrong/broken link: ${source}`);
      return { source, target, name, type: mount.type, action: 'existing' };
    }
    if (current && (mount.type === 'directory' ? !current.isDirectory() : !current.isFile())) throw new Error(`Source type mismatch: ${source}`);
    if (current && (!migrate || destination)) throw new Error(`Real source exists: ${source}. Use --migrate only when the private target is absent; never overwrite either copy.`);
    if (current && name === '.codegraph' && entry(path.join(source, 'daemon.pid'))) throw new Error('Stop the project CodeGraph daemon before migrating .codegraph');
    if (!current && !destination && mount.type === 'file') throw new Error(`Missing shared file: ${target}; pull Hub first`);
    return { source, target, name, type: mount.type, action: current ? 'migrate' : 'mount' };
  });
  for (let i = 0; i < plans.length; i++) for (let j = i + 1; j < plans.length; j++) {
    const a = plans[i].target, b = plans[j].target;
    if (a === b || a.startsWith(b + path.sep) || b.startsWith(a + path.sep)) throw new Error('Private mount targets overlap');
  }
  if (dryRun) { for (const p of plans) console.log(`${p.action}: ${p.source} -> ${p.target}`); return plans; }
  const exclude = path.resolve(repo, git(repo, 'rev-parse', '--git-path', 'info/exclude'));
  fs.mkdirSync(path.dirname(exclude), { recursive: true });
  let ignores = entry(exclude) ? fs.readFileSync(exclude, 'utf8') : '';
  for (const p of plans) if (!ignores.split(/\r?\n/).includes(`/${p.name}`)) ignores += `\n/${p.name}\n`;
  fs.writeFileSync(exclude, ignores);
  for (const p of plans) {
    if (p.action === 'existing') { git(repo, 'check-ignore', '--', p.name); console.log(`unchanged: ${p.name}`); continue; }
    fs.mkdirSync(path.dirname(p.target), { recursive: true });
    if (p.action === 'migrate') {
      const before = snapshot(p.source);
      fs.cpSync(p.source, p.target, { recursive: true, errorOnExist: true, force: false, preserveTimestamps: true });
      if (snapshot(p.target) !== before || snapshot(p.source) !== before) throw new Error(`Copy verification failed; original retained: ${p.source}`);
      const backup = inside(repo, `${p.source}.hub-migration-${crypto.randomUUID()}`);
      inside(repo, p.source); inside(repo, backup);
      fs.renameSync(p.source, backup);
      try {
        link(p.target, p.source, p.type);
        if (fs.realpathSync(p.source) !== fs.realpathSync(p.target) || snapshot(fs.realpathSync(p.source)) !== before) throw new Error('Mounted content verification failed');
      } catch (error) {
        if (entry(p.source)?.isSymbolicLink()) fs.unlinkSync(p.source);
        fs.renameSync(backup, p.source);
        throw error;
      }
      if (snapshot(backup) !== before) throw new Error(`Original changed during migration; backup retained: ${backup}`);
      inside(repo, backup);
      fs.rmSync(backup, { recursive: p.type === 'directory' });
    } else {
      if (!entry(p.target)) fs.mkdirSync(p.target);
      link(p.target, p.source, p.type);
    }
    git(repo, 'check-ignore', '--', p.name);
    console.log(`${p.action}: ${p.name} -> private/${project}/${path.relative(privateRoot, p.target).split(path.sep).join('/')}`);
  }
  return plans;
}

export function detachProject({ hub, env, project, config, local, dryRun = false }) {
  const { definition, repo, privateRoot } = resolveProjectPaths(hub, env, project, config, local);
  const mounts = Object.entries(definition.private_mounts || {});
  if (!mounts.length) return [];
  const results = [];
  for (const [name, mount] of mounts) {
    const source = inside(repo, path.join(repo, name));
    const target = inside(privateRoot, path.resolve(privateRoot, mount.target));
    const current = entry(source);
    if (current?.isSymbolicLink()) {
      if (fs.existsSync(target) && fs.realpathSync(source) === fs.realpathSync(target)) {
        if (dryRun) {
          console.log(`detach (dry-run): ${name} [unlink link]`);
          results.push({ name, action: 'detach-dry' });
        } else {
          fs.unlinkSync(source);
          console.log(`detached: ${name}`);
          results.push({ name, action: 'detached' });
        }
      } else {
        console.warn(`warning: ${name} symlink target mismatch, skipping`);
      }
    } else if (current) {
      console.warn(`warning: ${name} is real file/directory, refusing to detach`);
    } else {
      console.log(`absent: ${name}`);
      results.push({ name, action: 'absent' });
    }
  }
  return results;
}

export function setup({ hub, env, project, migrate = false, dryRun = false }) {
  if (!/^[a-z][a-z0-9-]*$/.test(env || '')) throw new Error('Explicit --env is required');
  hub = fs.realpathSync(hub);
  const config = readConfig(path.join(hub, 'projects.yaml'));
  const local = readConfig(path.join(hub, 'environments', env, 'projects.local.yaml'));
  if (config.version !== 1 || local.version !== 1 || local.environment !== env) throw new Error('Configuration version/environment mismatch');
  if (project) {
    if (!/^[a-z][a-z0-9-]*$/.test(project)) throw new Error(`Invalid project name: ${project}`);
    return setupProject({ hub, env, project, config, local, migrate, dryRun });
  }
  const targets = Object.keys(config.projects || {}).filter(id => {
    const def = config.projects[id];
    const mapping = local.paths?.[id];
    return def?.enabled && mapping?.transport === 'local' && def?.private_mounts && Object.keys(def.private_mounts).length > 0;
  });
  if (!targets.length) {
    console.log(`No projects with private_mounts found for environment: ${env}`);
    return [];
  }
  const allResults = [];
  for (const id of targets) {
    console.log(`=== ${id} ===`);
    allResults.push({ project: id, plans: setupProject({ hub, env, project: id, config, local, migrate, dryRun }) });
  }
  return allResults;
}

export function detach({ hub, env, project, dryRun = false }) {
  if (!/^[a-z][a-z0-9-]*$/.test(env || '')) throw new Error('Explicit --env is required');
  hub = fs.realpathSync(hub);
  const config = readConfig(path.join(hub, 'projects.yaml'));
  const local = readConfig(path.join(hub, 'environments', env, 'projects.local.yaml'));
  if (config.version !== 1 || local.version !== 1 || local.environment !== env) throw new Error('Configuration version/environment mismatch');
  if (project) {
    if (!/^[a-z][a-z0-9-]*$/.test(project)) throw new Error(`Invalid project name: ${project}`);
    return detachProject({ hub, env, project, config, local, dryRun });
  }
  const targets = Object.keys(config.projects || {}).filter(id => {
    const def = config.projects[id];
    const mapping = local.paths?.[id];
    return def?.enabled && mapping?.transport === 'local' && def?.private_mounts && Object.keys(def.private_mounts).length > 0;
  });
  const allResults = [];
  for (const id of targets) {
    console.log(`=== detach: ${id} ===`);
    allResults.push({ project: id, results: detachProject({ hub, env, project: id, config, local, dryRun }) });
  }
  return allResults;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = { hub: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') };
    while (args.length) {
      const arg = args.shift();
      if (arg === '--env') options.env = args.shift();
      else if (arg === '--project') options.project = args.shift();
      else if (arg === '--migrate') options.migrate = true;
      else if (arg === '--dry-run') options.dryRun = true;
      else if (arg === '--detach') options.detach = true;
      else throw new Error(`Unknown argument: ${arg}`);
    }
    if (options.detach) detach(options);
    else setup(options);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
