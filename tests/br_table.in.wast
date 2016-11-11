  (module (func $stmt (param $i i32) (result i32) ;; +3
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
              (br 2)
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
  ))
