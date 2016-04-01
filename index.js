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
 * [] fix breaks
 *    [] test on spec
 *    [] inject at leafs
 * [] run test suite
 * [] add memory count
 *   [] define count func
 */
'use strict'
const parser = require('wast-parser')
const codegen = require('wast-codegen')
const AST = require('wast-graph')
let graph
let addGasIndex

function addImport (rootNode) {
  const json = {
    'kind': 'import',
    'modName': {
      kind: 'literal',
      value: 'ethereum'
    },
    'funcName': {
      kind: 'literal',
      value: 'gasAdd'
    },
    'type': null,
    'params': [{
      'kind': 'param',
      'items': [{
        'kind': 'item',
        'type': 'i32'
      }]
    }]
  }

  const body = rootNode.get('body')
  for (let item of body.edges) {
    item[1].get('body').push(json)
  }
}

function addGasCountBlock (amount, node, index) {
  const call_import = {
    'kind': 'call_import',
    'id': {
      kind: 'literal',
      value: addGasIndex,
      raw: addGasIndex
    },
    'exprs': [{
      'kind': 'const',
      'type': 'i32',
      'init': amount
    }]
  }
  const body = node.value.array ? node : node.get('body')
  body.insertAt(index, call_import)
}

function injectGasTransform (vertex, startIndex) {
  startIndex = startIndex ? startIndex : 0
  const result = calcGas(vertex, startIndex)
  if (result.gas) {
    addGasCountBlock(result.gas, vertex, startIndex)
  }
}

function calcGas (vertex, startIndex) {
  const kind = vertex.kind
  // console.log(kind)
  const retVal = {
    gas: kind ? 1 : 0
  }

  if (kind === 'then') {
    retVal.gas = 0
  }

  if (kind === 'else') {
    retVal.gas = 0
  }

  // console.log(kind)
  if (kind === 'param') {
    return {gas: 1}
  }

  if (kind === 'result') {
    return {gas: 1}
  }

  if (kind === 'identifier') {
    return {gas: 0}
  }

  if (kind === 'literal') {
    return {gas: 0}
  }

  if (kind === 'if') {
    const result = calcGas(vertex.edges.get('test'), 0)
    let then = vertex.get('then')
    let els = vertex.get('else')
    if (then.kind !== 'then' && then.kind !== 'block') {
      const statement = then.copy()
      then = new AST('then')
      then.get('body').unshift(statement)
      vertex.set('then', then)
    }else if (els && els.kind !== 'else' && then.kind !== 'block') {
      const statement = els.copy()
      els = new AST('else')
      els.get('body').unshift(statement)
      vertex.set('else', els)
    }

    injectGasTransform(then)
    if (els) {
      injectGasTransform(els)
    }
    result.gas++
    return result
  }

  const edges = [...vertex.edges].slice(startIndex)
  // console.log(edges)
  for (const node of edges) {
    // console.log(node)
    const result = calcGas(node[1], 0)
    // console.log(result)
    retVal.branchPoint = result.branchPoint
    retVal.gas += result.gas
    if (result.branchPoint && vertex.value.array) {
      // console.log('break!!!')
      // found a new subtree
      injectGasTransform(vertex, node[0] + 1)
      return retVal
    } else {
      if (!retVal.leaf) {
        retVal.leaf = result.leaf
      }
    }
  }

  if (vertex.isBranch) {
    retVal.branchPoint = true
  }
  // console.log(vertex)
  // console.log(kind + ' ' + retVal.gas + ' ' + vertex.isLeaf)
  return retVal
}

module.exports.injectWAST = (wast, spacing) => {
  if (typeof wast !== 'string') {
    wast = wast.toString()
  }

  const astJSON = parser.parse(wast)
  // console.log(JSON.stringify(astJSON, null, 2))
  const transformedJSON = injectJSON(astJSON)
  // console.log(JSON.stringify(transformedJSON, null, 2))
  return codegen.generate(transformedJSON, spacing)
}

const injectJSON = module.exports.injectJSON = (json) => {
  const astGraph = graph = new AST(json)
  // console.log(JSON.stringify(graph.toJSON(), null, 2))
  addGasIndex = astGraph.importTable.length
  addImport(astGraph)
  const funcs = astGraph.edges.get('body').edges.get(0).edges.get('body')
  for (const func of funcs.edges) {
    if (func[1].kind === 'func') {
      injectGasTransform(func[1], addGasIndex)
    }
  }
  return astGraph.toJSON()
}
