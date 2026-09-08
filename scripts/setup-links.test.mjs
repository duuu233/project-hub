import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { setup, detach, readConfig } from './setup-links.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hub-links-'));
  const hub = path.join(root, 'hub'), repo = path.join(root, 'team');
  fs.mkdirSync(path.join(hub, 'environments', 'test'), { recursive: true });
  fs.mkdirSync(repo);
  execFileSync('git', ['init', repo], { stdio: 'ignore' });
  fs.writeFileSync(path.join(hub, 'projects.yaml'), 'version: 1\nprojects:\n  sample:\n    enabled: true\n    private_mounts:\n      docs:\n        target: docs\n        type: directory\n');
  fs.writeFileSync(path.join(hub, 'environments/test/projects.local.yaml'), `version: 1\nenvironment: test\npaths:\n  sample:\n    transport: local\n    path: '${repo.replaceAll('\\', '/')}'\n`);
  t.after(() => {
    // Unlink junction explicitly before recursive fixture cleanup.
    const doc = path.join(repo, 'docs');
    if (fs.existsSync(doc) && fs.lstatSync(doc).isSymbolicLink()) fs.unlinkSync(doc);
    assert.ok(root.startsWith(path.join(os.tmpdir(), 'hub-links-')));
    fs.rmSync(root, { recursive: true });
  });
  return { root, hub, repo, options: { hub, env: 'test', project: 'sample' } };
}
test('migration preserves bytes, removes original copy, ignores mount, and is idempotent', t => {
  const { hub, repo, options } = fixture(t);
  fs.mkdirSync(path.join(repo, 'docs'));
  fs.writeFileSync(path.join(repo, 'docs/notes.md'), '中文\r\nprivate notes\n');
  assert.throws(() => setup(options), /Real source exists/);
  setup({ ...options, migrate: true });
  assert.ok(fs.lstatSync(path.join(repo, 'docs')).isSymbolicLink());
  assert.equal(fs.readFileSync(path.join(hub, 'private/sample/docs/notes.md'), 'utf8'), '中文\r\nprivate notes\n');
  fs.writeFileSync(path.join(repo, 'docs/notes.md'), 'updated through link');
  assert.equal(fs.readFileSync(path.join(hub, 'private/sample/docs/notes.md'), 'utf8'), 'updated through link');
  setup(options);
  assert.equal(execFileSync('git', ['-C', repo, 'status', '--porcelain'], { encoding: 'utf8' }), '');
  assert.equal(fs.readdirSync(repo).filter(n => n.includes('hub-migration')).length, 0);
});
test('existing private target prevents overwriting local documentation', t => {
  const { hub, repo, options } = fixture(t);
  fs.mkdirSync(path.join(repo, 'docs'));
  fs.mkdirSync(path.join(hub, 'private/sample/docs'), { recursive: true });
  assert.throws(() => setup({ ...options, migrate: true }), /never overwrite/);
  assert.ok(!fs.lstatSync(path.join(repo, 'docs')).isSymbolicLink());
});
test('refuses team tracked docs and path traversal', t => {
  const { hub, repo, options } = fixture(t);
  fs.mkdirSync(path.join(repo, 'docs'));
  fs.writeFileSync(path.join(repo, 'docs/a.md'), 'team-owned');
  execFileSync('git', ['-C', repo, 'add', 'docs']);
  assert.throws(() => setup({ ...options, migrate: true }), /Team Git tracks/);
  const file = path.join(hub, 'projects.yaml');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('target: docs', 'target: ../../escape'));
  assert.throws(() => setup(options), /Invalid mount/);
});
test('dry run makes no changes; duplicate mapping keys rejected', t => {
  const { hub, repo, options } = fixture(t);
  setup({ ...options, dryRun: true });
  assert.equal(fs.existsSync(path.join(hub, 'private')), false);
  assert.equal(fs.existsSync(path.join(repo, 'docs')), false);
  fs.writeFileSync(path.join(hub, 'duplicate.yaml'), 'version: 1\nversion: 1\n');
  assert.throws(() => readConfig(path.join(hub, 'duplicate.yaml')), /Duplicate key/);
});
test('detach removes symlinks in team repository without deleting private files in hub', t => {
  const { hub, repo, options } = fixture(t);
  fs.mkdirSync(path.join(repo, 'docs'));
  fs.writeFileSync(path.join(repo, 'docs/notes.md'), 'private notes');
  setup({ ...options, migrate: true });
  assert.ok(fs.lstatSync(path.join(repo, 'docs')).isSymbolicLink());
  assert.ok(fs.existsSync(path.join(hub, 'private/sample/docs/notes.md')));

  detach(options);
  assert.ok(!fs.existsSync(path.join(repo, 'docs')));
  assert.ok(fs.existsSync(path.join(hub, 'private/sample/docs/notes.md')));
  assert.equal(fs.readFileSync(path.join(hub, 'private/sample/docs/notes.md'), 'utf8'), 'private notes');
});
test('batch setup processes all projects when project is omitted', t => {
  const { hub, repo } = fixture(t);
  fs.mkdirSync(path.join(hub, 'private/sample/docs'), { recursive: true });
  fs.writeFileSync(path.join(hub, 'private/sample/docs/test.txt'), 'batch test');

  const results = setup({ hub, env: 'test' });
  assert.equal(results.length, 1);
  assert.equal(results[0].project, 'sample');
  assert.ok(fs.lstatSync(path.join(repo, 'docs')).isSymbolicLink());
});
