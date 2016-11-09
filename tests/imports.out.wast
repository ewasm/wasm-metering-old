(module
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
    (param i32)))
