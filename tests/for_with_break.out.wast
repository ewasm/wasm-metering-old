(module
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
    (param i32)))
