(module
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
    (param i32)))
