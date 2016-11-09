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
  (import "ethereum" "useGas"
    (param i32)))
