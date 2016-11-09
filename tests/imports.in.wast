(module
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
)
