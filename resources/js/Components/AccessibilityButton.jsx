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
        <button
            role="button"
            aria-pressed={isBold}
            aria-label={isBold ? 'Dikke tekst staat aan, klik om uit te zetten' : 'Dikke tekst staat uit, klik om aan te zetten'}
            onClick={toggleBold}
            className={`${wrapperClass} select-none`}
            style={wrapperStyle}
        >
            <span
                aria-hidden="true"
                className="inline-flex items-center justify-center h-5 w-5 rounded border-2 flex-shrink-0 transition-colors duration-150"
                style={{
                    borderColor: '#000000',
                    backgroundColor: isBold ? '#7B5EA7' : '#ffffff',
                }}
            >
                {isBold && (
                    <svg viewBox="0 0 12 10" width="12" height="10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5l3.5 3.5L11 1" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>

            <span aria-hidden="true" className="ms-3 text-base font-medium text-gray-800">
                <span className="font-bold text-xl mr-1">A </span>
                Zet de dikke tekst aan/uit
            </span>
        </button>
    );
}
