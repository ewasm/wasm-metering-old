# SYNOPSIS 
[![NPM Package](https://img.shields.io/npm/v/wasm-metering.svg?style=flat-square)](https://www.npmjs.org/package/wasm-metering)
[![Build Status](https://img.shields.io/travis/wanderer/wasm-metering.svg?branch=master&style=flat-square)](https://travis-ci.org/wanderer/wasm-metering)
[![Coverage Status](https://img.shields.io/coveralls/wanderer/wasm-metering.svg?style=flat-square)](https://coveralls.io/r/wanderer/wasm-metering)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)  

This injects metering into wasm's ast. Metered code is code that counts how many steps it has run. The meter counting should be done in a protected location. Here we use `(import "ethereum" "addGas" (param i32))` This assume that the ffi will provide an `addGas` function. For a full description of how this works see [Metering in eWASM](https://github.com/ethereum/evm2.0-design/blob/master/metering.md)

# USAGE

```javascript
const metering = require('wasm-metering')
const wast = 
`(module
  (func (param i64)
    (if (i64.eq (get_local 0) (i64.const 0))
      (i64.const 1))))`

const result = metering.injectWAST(wast, 2)
console.log(result)

/**
(module
  (func
    (param i64)
    (call_import 0
      (i32.const 6))
    (if
      (i64.eq
        (get_local 0)
        (i64.const 0))
      (then
        (call_import 0
          (i32.const 1))
        (i64.const 1))))
  (import "ethereum" "gasAdd"
    (param i32)))
**/
```
## CLI
Install globally  
`npm install wasm-metering -g`  
then invoke  
`injectMetering <path_to_wast_file> <number_of_space_indention>`

# API
## injectJSON

[index.js:169-181](https://github.com/wanderer/wasm-metering/blob/f59127389d75fb8c3c468fe5e611c34f8ff1868f/index.js#L169-L181 "Source code on GitHub")

Injects metering into the json ast

**Parameters**

-   `json` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)**

## injectWAST

[index.js:155-163](https://github.com/wanderer/wasm-metering/blob/f59127389d75fb8c3c468fe5e611c34f8ff1868f/index.js#L155-L163 "Source code on GitHub")

Inject metering into wasm text

**Parameters**

-   `wast` **sting** code in the wasm text format
-   `spacing` **integer** the number of spaces for the indentation


# LICENSE
[MPL-2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2))
