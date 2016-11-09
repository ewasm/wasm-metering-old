(module
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
      (i64.const 6))))
