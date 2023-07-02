(module
    (memory (export "memory") 1)

    (data (i32.const 0) "0123456789abcdef")
    (global $itoa_out_buf i32 (i32.const 16))

    (func $itoa16 (export "itoa16") (param $num i64) (result i32 i32)
        (local $numtmp i64)
        (local $numlen i32)
        (local $writeidx i32)
        (local $digit i64)
        (local $dchar i64)

        (i64.lt_s (local.get $num) (i64.const 16))
        if
            (local.set $numlen (i32.const 1))
        else
            (local.set $numlen (i32.const 0))
            (local.set $numtmp (local.get $num))
            (loop $countloop (block $breakcountloop
                (i64.eqz (local.get $numtmp))
                br_if $breakcountloop

                (local.set $numtmp (i64.div_u (local.get $numtmp) (i64.const 16)))
                (local.set $numlen (i32.add (local.get $numlen) (i32.const 1)))
                br $countloop
            ))
        end

        (local.set $writeidx 
            (i32.sub 
                (i32.add (global.get $itoa_out_buf) (local.get $numlen))
                (i32.const 1)))

        (loop $writeloop (block $breakwriteloop
            ;; digit <- $num % 10
            (local.set $digit (i64.rem_u (local.get $num) (i64.const 16)))
            ;; set the char value from the lookup table of digit chars
            (local.set $dchar (i64.load8_u offset=0 (i32.wrap_i64 (local.get $digit))))
            
            ;; mem[writeidx] <- dchar
            (i64.store8 (local.get $writeidx) (local.get $dchar))

            ;; num <- num / 10
            (local.set $num (i64.div_u (local.get $num) (i64.const 16)))

            ;; If after writing a number we see we wrote to the first index in
            ;; the output buffer, we're done.
            (i32.eq (local.get $writeidx) (global.get $itoa_out_buf))
            br_if $breakwriteloop

            (local.set $writeidx (i32.sub (local.get $writeidx) (i32.const 1)))
            br $writeloop
        ))

        (global.get $itoa_out_buf)
        (local.get $numlen)
    )

    (func $itoa (export "itoa") (param $num i64) (result i32 i32)
        (local $numtmp i64)
        (local $numlen i32)
        (local $writeidx i32)
        (local $digit i64)
        (local $dchar i64)

        (i64.lt_s (local.get $num) (i64.const 10))
        if
            (local.set $numlen (i32.const 1))
        else
            (local.set $numlen (i32.const 0))
            (local.set $numtmp (local.get $num))
            (loop $countloop (block $breakcountloop
                (i64.eqz (local.get $numtmp))
                br_if $breakcountloop

                (local.set $numtmp (i64.div_u (local.get $numtmp) (i64.const 10)))
                (local.set $numlen (i32.add (local.get $numlen) (i32.const 1)))
                br $countloop
            ))
        end

        (local.set $writeidx 
            (i32.sub 
                (i32.add (global.get $itoa_out_buf) (local.get $numlen))
                (i32.const 1)))

        (loop $writeloop (block $breakwriteloop
            ;; digit <- $num % 10
            (local.set $digit (i64.rem_u (local.get $num) (i64.const 10)))
            ;; set the char value from the lookup table of digit chars
            (local.set $dchar (i64.load8_u offset=0 (i32.wrap_i64 (local.get $digit))))
            
            ;; mem[writeidx] <- dchar
            (i64.store8 (local.get $writeidx) (local.get $dchar))

            ;; num <- num / 10
            (local.set $num (i64.div_u (local.get $num) (i64.const 10)))

            ;; If after writing a number we see we wrote to the first index in
            ;; the output buffer, we're done.
            (i32.eq (local.get $writeidx) (global.get $itoa_out_buf))
            br_if $breakwriteloop

            (local.set $writeidx (i32.sub (local.get $writeidx) (i32.const 1)))
            br $writeloop
        ))

        (global.get $itoa_out_buf)
        (local.get $numlen)
    )
)
