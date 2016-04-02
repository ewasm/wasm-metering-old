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
  (import "ethereum" "gasAdd"
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
  (import "ethereum" "gasAdd"
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
  (import "ethereum" "gasAdd"
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
  (import "ethereum" "gasAdd"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, resultWast)
  t.end()
})

tape('br_table', function (t) {
  const testWast =
  `(module (func $stmt (param $i i32) (result i32)
    (local $j i32)
    (set_local $j (i32.const 100))
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
                          (get_local $i)
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
      (i32.const 17))
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
  (import "ethereum" "gasAdd"
    (param i32)))`

  const result = injector.injectWAST(testWast, 2)
  t.equals(result, expected)
  t.end()
})
