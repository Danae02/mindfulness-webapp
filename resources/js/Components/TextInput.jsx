import { forwardRef, useEffect, useRef, useCallback } from 'react';

const TextInput = forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref
) {
    const localRef = useRef(null);

    const setRef = useCallback((el) => {
        localRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
    }, [ref]);

    useEffect(() => {
        if (isFocused && localRef.current) {
            localRef.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
            ref={setRef}
        />
    );
});

export default TextInput;
