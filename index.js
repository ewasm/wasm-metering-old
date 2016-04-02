/**
 *
 * Metering is done by summing the "contunois" subtrees of the AST
 * Countunous := no break or return conditions
 * if a break condition happens in a block then the block can be though of
 * as two sperate subtrees
 *
 * 1) if br's are found inject `addGas` in the next insertion point
 *  insertion point is beging of next block
 *  or the adding or encapsolation the last statment
 *
 *
 * TODO
 * [*] fix breaks
 *    [*] inject at leafs
 * [*] fix select
 * [] run test suite
 * [] add memory count
 *   [] define count func
 */
'use strict'
const parser = require('wast-parser')
const codegen = require('wast-codegen')
const AST = require('wast-graph')
let addGasIndex // a messy global

// adds the import statement for the Ethereum system module
// '(import "ethereum" "gasAdd" (param i32))'
function addImport (rootNode) {
  const json = {
    kind: 'import',
    modName: {
      kind: 'literal',
      value: 'ethereum'
    },
    funcName: {
      kind: 'literal',
      value: 'gasAdd'
    },
    type: null,
    params: [{
      kind: 'param',
      items: [{
        kind: 'item',
        type: 'i32'
      }]
    }]
  }

  // we are assuming the root node is "script"
  // find the `module`s and inject the import
  const body = rootNode.get('body')
  for (let item of body.edges) {
    if (item[1].kind === 'module') {
      item[1].get('body').push(json)
    }
  }
}

// adds a gas counting statement to a node
// (call_import <addGasindex> (i32.const <amount>))
function addGasCountBlock (amount, node, index) {
  const call_import = {
    kind: 'call_import',
    id: {
      kind: 'literal',
      value: addGasIndex,
      raw: addGasIndex
    },
    exprs: [{
      kind: 'const',
      type: 'i32',
      init: amount
    }]
  }
  const body = node.kind === 'array' ? node : node.get('body')
  body.insertAt(index, call_import)
}

// injects metering into an AST
function meteringTransform (vertex, startIndex) {
  if (startIndex === undefined) {
    startIndex = 0
  }
  // find the gas
  const result = calcGas(vertex, startIndex)
  if (result.gas) {
    // inject the metering statement
    addGasCountBlock(result.gas, vertex, startIndex)
  }
}

// travers a subtree and counts
function calcGas (vertex, startIndex) {
  const kind = vertex.kind
  const dontCount = new Set(['identifier', 'literal', 'param', 'then', 'else', 'array'])

  if (kind === 'if') {
    // splits a if statement into two subtrees (then and else)
    let then = vertex.get('then')
    let els = vertex.get('else')
    if (then.kind !== 'then' && then.kind !== 'block') {
      // adds a `then` block that already exist implicitly
      const statement = then.copy()
      then = new AST('then')
      then.get('body').unshift(statement)
      vertex.set('then', then)
    } else if (els && els.kind !== 'else' && els.kind !== 'block') {
      // adds an `else` block that already exist implicitly
      const statement = els.copy()
      els = new AST('else')
      els.get('body').unshift(statement)
      vertex.set('else', els)
    }
    meteringTransform(then)
    if (els) {
      meteringTransform(els)
    }

    // calculates the gas for the test statement
    const result = calcGas(vertex.edges.get('test'), 0)
    result.gas++
    return result
  } else {
    const retVal = {
      gas: ~~!dontCount.has(kind),
      branchPoint: vertex.isBranch
    }
    const edges = [...vertex.edges].slice(startIndex)
    for (const node of edges) {
      const result = calcGas(node[1], 0)
      retVal.branchPoint |= result.branchPoint
      retVal.gas += result.gas
      if (result.branchPoint && vertex.kind === 'array') {
        // found a new subtree
        meteringTransform(vertex, node[0] + 1)
        return retVal
      }
    }
    return retVal
  }
}

/**
 * Inject metering into wasm text
 * @param {sting} wast code in the wasm text format
 * @param {integer} spacing the number of spaces for the indentation
 */
module.exports.injectWAST = (wast, spacing) => {
  if (typeof wast !== 'string') {
    wast = wast.toString()
  }

  const astJSON = parser.parse(wast)
  const transformedJSON = injectJSON(astJSON)
  return codegen.generate(transformedJSON, spacing)
}

/**
 * Injects metering into the json ast
 * @param {object} json
 */
const injectJSON = module.exports.injectJSON = (json) => {
  const astGraph = new AST(json)
  addGasIndex = astGraph.importTable.length
  addImport(astGraph)
  // finds all the function in a module
  const funcs = astGraph.edges.get('body').edges.get(0).edges.get('body')
  for (const func of funcs.edges) {
    if (func[1].kind === 'func') {
      meteringTransform(func[1])
    }
  }
  return astGraph.toJSON()
}
