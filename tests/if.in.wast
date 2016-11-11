(module
  (func (param i64) (result i64)
    (if i64
      (i64.eq (get_local 0) (i64.const 0))
      (then (i64.const 1))
      (else (i64.const 0)))))
