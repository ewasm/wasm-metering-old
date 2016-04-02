#!/usr/bin/env node
'use strict'

const fs = require('fs')
const injector = require('../')
const argv = require('yargs').argv
const wastFile = fs.readFileSync(argv._[0])

process.stdout.write(injector.injectWAST(wastFile))
