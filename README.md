# SYNOPSIS 
[![NPM Package](https://img.shields.io/npm/v/wasm-metering.svg?style=flat-square)](https://www.npmjs.org/package/wasm-metering)
[![Build Status](https://img.shields.io/travis/wanderer/wasm-metering.svg?branch=master&style=flat-square)](https://travis-ci.org/wanderer/wasm-metering)
[![Coverage Status](https://img.shields.io/coveralls/wanderer/wasm-metering.svg?style=flat-square)](https://coveralls.io/r/wanderer/wasm-metering)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)  

This injects metering into wasm's ast

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

[index.js:161-173](https://github.com/wanderer/wasm-metering/blob/6f715c5a21c0413521d5da5598a66378ce50c166/index.js#L161-L173 "Source code on GitHub")

Injects metering into a [json ast](https://github.com/drom/wast-spec)

**Parameters**

-   `json` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)**

## injectWAST

[index.js:147-155](https://github.com/wanderer/wasm-metering/blob/6f715c5a21c0413521d5da5598a66378ce50c166/index.js#L147-L155 "Source code on GitHub")

Inject metering into wasm text

**Parameters**

-   `wast` **sting** code in the wasm text format
-   `spacing` **integer** the number of spaces for the indentation

# LICENSE
[MPL-2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2))
