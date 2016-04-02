#!/usr/bin/env node
'use strict'

const fs = require('fs')
const injector = require('../')
const argv = require('yargs').argv

if (!argv._.length) {
  console.log('usage: injectMetering <path_to_wast_file> <number_of_space_indention>')
  process.exit()
}

const wastFile = fs.readFileSync(argv._[0])
const spacing = argv._[1]

process.stdout.write(injector.injectWAST(wastFile, spacing))
