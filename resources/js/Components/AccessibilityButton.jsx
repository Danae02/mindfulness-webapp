import { useState, useEffect } from 'react';

export default function AccessibilityButton() {
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
        if (isBold) {
            document.body.classList.remove('bold-font');
            document.body.style.fontWeight = '';
            localStorage.setItem('bold-font', 'false');
            setIsBold(false);
        } else {
            document.body.classList.add('bold-font');
            document.body.style.fontWeight = '800';
            localStorage.setItem('bold-font', 'true');
            setIsBold(true);
        }
    };

    return (
        <div
            className={`inline-flex items-center px-4 py-3 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                isBold ? 'scale-90' : ''
            }`}
            style={{
                backgroundColor: '#F0E8FF',
                borderColor: '#000000'
            }}
            onClick={toggleBold}
        >
            <label className="flex items-center cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isBold}
                    onChange={() => {}}
                    className="h-5 w-5 text-primary rounded border-gray-400 focus:ring-primary focus:ring-offset-0"
                />
                <span className={`ms-3 text-base font-medium text-gray-800 ${isBold ? 'text-sm' : ''}`}>
                    <span className={`font-bold ${isBold ? 'text-base' : 'text-xl'} mr-1`}>A </span>
                     Zet de dikke tekst aan/uit
                </span>
            </label>
        </div>
    );
}
