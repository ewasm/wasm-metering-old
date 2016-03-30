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
const Graph = require('wast-graph')
let graph

// const branchConditions = new Set(['if', 'br'])
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

  const body = rootNode.edges.get('body')
  for (let item of body.edges) {
    item[1].edges.get('body').push(json)
  }
}

function addGasCountBlock (amount, node) {

  const blockJSON = {
    'kind': 'block',
    'id': null,
    'body': [{
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
    }]
  }

  const leaf = node.copy()
  node.parse(blockJSON)
  const body = node.getEdge('body')
  body.push(leaf)
}

function injectGasTransform (vertex, startIndex) {
  startIndex = startIndex ? 0 : startIndex
  const result = findGasAndLeaf(vertex, startIndex)
  addGasCountBlock(result.gas, result.leaf)
}

function findGasAndLeaf (vertex, startIndex) {
  const kind = vertex.kind
  console.log(kind)
  const retVal = {
    gas: kind ? 1 : 0
  }

  if (kind === 'param') {
    return {gas: 1}
  }

  if (kind === 'result') {
    return {gas: 1}
  }

  if (kind === 'if') {
    const result = findGasAndLeaf(vertex.edges.get('test'), 0)
    injectGasTransform(vertex.edges.get('then'))
    injectGasTransform(vertex.edges.get('else'))
    result.gas++
    return result
  }

  if (vertex.isBranch) {
    retVal.branchPoint = true
  }
  // find the first leaf
  if (vertex.isLeaf) {
    retVal.leaf = vertex
  } else {
    const edges = [...vertex.edges].slice(startIndex)
    for (const node of edges) {
      const result = findGasAndLeaf(node[1], 0)
      if (result.branchPoint && vertex.isLabled) {
        // found a new subtree
        injectGasTransform(vertex, node[0])
        // resest the gas count
        return {
          gas: 0,
          branchPoint: true
        }
      } else {
        retVal.gas += result.gas
        if (!retVal.leaf) {
          retVal.leaf = result.leaf
        }
      }
    }
  }
  return retVal
}

module.exports.injectWAST = (wast) => {
  if (typeof wast !== 'string') {
    wast = wast.toString()
  }

  const astJSON = parser.parse(wast)
  // console.log(JSON.stringify(astJSON, null, 2))
  const transformedJSON = injectJSON(astJSON)
  // console.log(JSON.stringify(transformedJSON, null, 2))
  return codegen.generate(transformedJSON)
}

const injectJSON = module.exports.injectJSON = (json) => {
  const astGraph = graph = new Graph(json)
  console.log(JSON.stringify(graph.toJSON(), null, 2))
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
