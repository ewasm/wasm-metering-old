const tape = require('tape')
const injector = require('../')
const fs = require('fs')
const path = require('path')

const tests = [
  'basic',
  'br_table',
  'for_with_break',
  'if',
  'if_else',
  'imports',
  'loops'
]

function load (file) {
  return fs.readFileSync(path.join(__dirname, file)).toString()
}

for (const test of tests) {
  tape(test, function (t) {
    const result = injector.injectWAST(load(`${test}.in.wast`), 2)
    t.equals(result, load(`${test}.out.wast`))
    t.end()
  })
}
