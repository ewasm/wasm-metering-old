(module
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
    (param i32)))
