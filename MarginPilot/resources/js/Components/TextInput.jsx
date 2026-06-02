import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border-slate-200/80 bg-white/80 text-sm shadow-lg shadow-slate-200/20 backdrop-blur-xl transition-all duration-300 placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ' +
                className
            }
            ref={localRef}
        />
    );
});
