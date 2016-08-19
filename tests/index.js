const tape = require('tape')
const injector = require('../')

tape('basic', function (t) {
  const testWast =
    `(module
      (func
        (i64.const 1)))`

  const resultWast =
`(module
  (func
    (call_import 0
      (i32.const 2))
    (i64.const 1))
  (import "ethereum" "useGas"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, resultWast)
  t.end()
})

tape('if', function (t) {
  const testWast =
`(module
  (func (param i64)
    (if (i64.eq (get_local 0) (i64.const 0))
      (i64.const 1))))`

  const resultWast =
`(module
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
  (import "ethereum" "useGas"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, resultWast)
  t.end()
})

tape('if_else', function (t) {
  const testWast =
`(module
  (func (param i64)
    (if (i64.eq (get_local 0) (i64.const 0))
      (block (i64.const 1))
      (i64.const 1))))`

  const resultWast =
`(module
  (func
    (param i64)
    (call_import 0
      (i32.const 6))
    (if
      (i64.eq
        (get_local 0)
        (i64.const 0))
      (block
        (call_import 0
          (i32.const 2))
        (i64.const 1))
      (else
        (call_import 0
          (i32.const 1))
        (i64.const 1))))
  (import "ethereum" "useGas"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, resultWast)
  t.end()
})

tape('if_else', function (t) {
  const testWast =
`(module
  ;; Recursive factorial
  (func (param i64)
    (if (i64.eq (get_local 0) (i64.const 0))
      (then (i64.const 1))
      (else (i64.const 1)))))`

  const resultWast =
`(module
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
        (i64.const 1))
      (else
        (call_import 0
          (i32.const 1))
        (i64.const 1))))
  (import "ethereum" "useGas"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, resultWast)
  t.end()
})

tape('imports', function (t) {
  const testWast =
`(module
  (import $print "spectest" "print" (param i32))
  (func
    (block $zero ;; +1
      (block $one ;; +1
        (block $two ;; +1
          (br 0) ;; +1
          (unreachable)) ;; +1
        ;; block $one
        (call_import $print (i32.const 1)) ;; +2
        (nop)) ;; +1
      ;; block $zero
      (call_import $print (i32.const 2))) ;; +2
    ) ;; end of fun
)`

  const expected =
`(module
  (import $print "spectest" "print"
    (param i32))
  (func
    (call_import 1
      (i32.const 5))
    (block $zero
      (block $one
        (block $two
          (br 0)
          (unreachable))
        (call_import 1
          (i32.const 3))
        (call_import $print
          (i32.const 1))
        (nop))
      (call_import 1
        (i32.const 2))
      (call_import $print
        (i32.const 2))))
  (import "ethereum" "useGas"
    (param i32)))`
  const result = injector.injectWAST(testWast, 2)
  t.equals(result, expected)
  t.end()
})

tape('br_table', function (t) {
  const testWast =
  `(module (func $stmt (param $i i32) (result i32) ;; +3
    (local $j i32) ;; 4
    (set_local $j (i32.const 100)) ;; 6
    (block $switch ;; 7
      (block $7 ;; 8
        (block $default ;; 9
          (block $6 ;; 10
            (block $5 ;; 11
              (block $4 ;; 12
                (block $3 ;; 13
                  (block $2 ;;14
                    (block $1 ;;15
                      (block $0 ;;16
                        (br_table $0 $1 $2 $3 $4 $5 $6 $7 $default ;; 17
                          (get_local $i) ;;18
                        )
                      ) ;; 0
                      (return (get_local $i))
                    ) ;; 1
                    (nop)
                    ;; fallthrough
                  ) ;; 2
                  ;; fallthrough
                ) ;; 3
                (set_local $j (i32.sub (i32.const 0) (get_local $i)))
                (br $switch)
              ) ;; 4
              (br $AHAAHAHA)
            ) ;; 5
            (set_local $j (i32.const 101))
            (br $switch)
          ) ;; 6
          (set_local $j (i32.const 101))
          ;; fallthrough
        ) ;; default
        (set_local $j (i32.const 102))
      ) ;; 7
      ;; fallthrough
    )
    (return (get_local $j))
  ))`

  const expected =
`(module
  (func $stmt
    (param $i i32)
    (result i32)
    (local $j i32)
    (call_import 0
      (i32.const 18))
    (set_local $j
      (i32.const 100))
    (block $switch
      (block $7
        (block $default
          (block $6
            (block $5
              (block $4
                (block $3
                  (block $2
                    (block $1
                      (block $0
                        (br_table $0 $1 $2 $3 $4 $5 $6 $7 $default
                          (get_local $i)))
                      (call_import 0
                        (i32.const 2))
                      (return
                        (get_local $i)))
                    (call_import 0
                      (i32.const 1))
                    (nop)))
                (call_import 0
                  (i32.const 5))
                (set_local $j
                  (i32.sub
                    (i32.const 0)
                    (get_local $i)))
                (br $switch))
              (call_import 0
                (i32.const 1))
              (br $AHAAHAHA))
            (call_import 0
              (i32.const 3))
            (set_local $j
              (i32.const 101))
            (br $switch))
          (call_import 0
            (i32.const 2))
          (set_local $j
            (i32.const 101)))
        (call_import 0
          (i32.const 2))
        (set_local $j
          (i32.const 102))))
    (call_import 0
      (i32.const 2))
    (return
      (get_local $j)))
  (import "ethereum" "useGas"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, expected)
  t.end()
})

tape('for with break', function (t) {
  const testWast =
`(module
  (import $gasUsed  "ethereum" "getGasLeft"  (result i64))
  (export "test" 0)
  (func (result i32) ;; +2
    (block ;; +1
      (if ;; +1
        (i64.eq ;; +1
          (call_import $gasUsed) ;; +1
          (i64.const 8)) ;; +2
        (br 1) ;; +1
      )
      (i64.const 6))))`

  const resultWast =
`(module
  (import $gasUsed "ethereum" "getGasLeft")
  (export "test" 0)
  (func
    (result i32)
    (call_import 1
      (i32.const 7))
    (block
      (if
        (i64.eq
          (call_import $gasUsed)
          (i64.const 8))
        (then
          (call_import 1
            (i32.const 1))
          (br 1)))
      (call_import 1
        (i32.const 1))
      (i64.const 6)))
  (import "ethereum" "useGas"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, resultWast)
  t.end()
})

tape('loops', function (t) {
  const testWast =
    `(module
      (func "singular" (result i32)
        (loop (nop))
        (loop (i32.const 7))
      ))`

  const resultWast =
`(module
  (func "singular"
    (result i32)
    (call_import 0
      (i32.const 4))
    (loop
      (call_import 0
        (i32.const 1))
      (nop))
    (loop
      (call_import 0
        (i32.const 1))
      (i32.const 7)))
  (import "ethereum" "useGas"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, resultWast)
  t.end()
})
