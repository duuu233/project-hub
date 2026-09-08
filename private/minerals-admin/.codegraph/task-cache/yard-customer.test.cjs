const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const { reactive, ref, computed, watch, nextTick } = require('vue')

test('purchase selection, customer override and self-operated validation', async () => {
  const source = fs.readFileSync('src/views/sales-pickup/list/yard-add.vue', 'utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
  const ast = ts.createSourceFile('yard.ts', source, ts.ScriptTarget.Latest, true)
  const names = new Set(['form', 'state', 'formRef', 'selectedPurchaseOrder', 'isSelfOperated', 'customerOptions', 'rules'])
  const statements = ast.statements.filter(statement => {
    if (ts.isVariableStatement(statement)) return statement.declarationList.declarations.some(d => names.has(d.name.getText(ast)))
    const text = statement.getText(ast)
    return text.startsWith('watch(selectedPurchaseOrder,') || text.startsWith('watch(() => form.customerOrgId,')
  }).map(statement => statement.getText(ast)).join('\n')
  const compiled = ts.transpileModule(statements, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText
  const context = { reactive, ref, computed, watch, nextTick }
  vm.createContext(context)
  vm.runInContext(compiled + '\nthis.subject = { form, state, selectedPurchaseOrder, isSelfOperated, customerOptions, rules }', context)
  const { form, state, selectedPurchaseOrder, isSelfOperated, customerOptions, rules } = context.subject
  const settle = async () => { await nextTick(); await nextTick() }
  assert.equal(selectedPurchaseOrder.value, undefined)
  assert.equal(rules.value.customerOrgId[0].required, true)
  state.customerList = [{ value: '1', label: 'Original customer' }, { value: '2', label: 'Other customer' }]
  state.purchaseNoList = [
    { value: 'agency', customerId: 1, customerName: 'Order customer' },
    { value: 'fallback', customerId: '3', customerName: 'New customer' },
    { value: 'self' },
    { value: 'partial', customerId: '1', customerName: '  ' }
  ]
  form.purchaseNo = 'agency'
  await settle()
  assert.equal(isSelfOperated.value, false)
  assert.equal(form.customerOrgId, 1)
  assert.equal(form.customerOrgName, 'Order customer')
  form.customerOrgId = '2'
  await settle()
  assert.equal(form.customerOrgName, 'Other customer')
  assert.equal(form.customerOrgId, '2')
  form.purchaseNo = 'self'
  await settle()
  assert.equal(isSelfOperated.value, true)
  assert.equal(form.customerOrgId, '')
  assert.equal(form.customerOrgName, '')
  assert.equal(rules.value.customerOrgId[0].required, false)
  form.purchaseNo = 'fallback'
  await settle()
  assert.equal(form.customerOrgId, '3')
  assert.equal(form.customerOrgName, 'New customer')
  assert.equal(customerOptions.value.length, 3)
  assert.equal(rules.value.customerOrgId[0].required, true)
  state.customerList = [...state.customerList, { value: 3, label: 'Loaded later' }]
  await settle()
  assert.equal(customerOptions.value.find(item => item.value === form.customerOrgId)?.label, 'New customer')
  form.purchaseNo = 'partial'
  await settle()
  assert.equal(isSelfOperated.value, true)
  assert.equal(form.customerOrgId, '')
  form.purchaseNo = ''
  await settle()
  assert.equal(selectedPurchaseOrder.value, undefined)
  assert.equal(isSelfOperated.value, false)
  assert.equal(form.customerOrgId, '')
})
