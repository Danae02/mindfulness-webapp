import { useState, useEffect } from 'react';

export default function AccessibilityButton({ variant = 'plain' }) {
    const [isBold, setIsBold] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('bold-font');
        if (saved === 'true') {
            setIsBold(true);
            document.body.classList.add('bold-font');
            document.body.style.fontWeight = '800';
        }
    }, []);

    const toggleBold = () => {
        const next = !isBold;
        document.body.classList.toggle('bold-font', next);
        document.body.style.fontWeight = next ? '800' : '';
        localStorage.setItem('bold-font', String(next));
        setIsBold(next);
    };

    const wrapperClass = variant === 'button'
        ? 'inline-flex items-center px-4 py-3 rounded-full border-2 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]'
        : 'inline-flex items-center px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7] rounded';

    const wrapperStyle = variant === 'button'
        ? { backgroundColor: '#F0E8FF', borderColor: '#7B5EA7' }
        : {};

    return (
        <label
            className={`${wrapperClass} select-none`}
            style={wrapperStyle}
        >
            <input
                type="checkbox"
                role="switch"
                aria-checked={isBold}
                checked={isBold}
                onChange={toggleBold}
                className="h-5 w-5 rounded border-2 focus:ring-primary focus:ring-offset-0"
                style={{ borderColor: '#000000' }}
            />
            <span className="ms-3 text-base font-medium text-gray-800">
                <span className="font-bold text-xl mr-1" aria-hidden="true">A </span>
                Zet de dikke tekst aan/uit
            </span>
        </label>
    );
}
