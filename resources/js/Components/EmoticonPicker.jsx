import { useState, useRef, useEffect } from 'react';

const iconOptions = [
    { src: "/icons/really-happy-face.png", label: "Erg blij" },
    { src: "/icons/happy-face.png", label: "Blij" },
    { src: "/icons/angry-face.png", label: "Boos" },
    { src: "/icons/crying-face.png", label: "Verdrietig" },
    { src: "/icons/kinda-sad.png", label: "Beetje slecht" },
    { src: "/icons/neutral-face.png", label: "Neutraal" },
    { src: "/icons/relieved-face.png", label: "Opgelucht" },
    { src: "/icons/sad-face.png", label: "Slecht" },
];

export default function EmoticonPicker({ value, onChange, label = "Kies icoon (optioneel)" }) {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleIconSelect = (iconSrc, label) => {
        onChange({ src: iconSrc, label });
        setIsOpen(false);
    };

    const handleRemoveIcon = () => {
        onChange(null);
        setIsOpen(false);
    };

    const hasSelectedIcon = value && value.src;

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors flex-shrink-0"
                aria-label={label}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {hasSelectedIcon ? (
                    <img
                        src={value.src}
                        alt={value.label}
                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                    />
                ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-52 sm:w-64">
                    <p className="text-xs text-gray-500 mb-2 px-1">Kies een icoon:</p>
                    <div className="flex flex-wrap gap-1">
                        {iconOptions.map((icon, idx) => {
                            const isSelected = value?.src === icon.src;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleIconSelect(icon.src, icon.label)}
                                    className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
                                        isSelected ? 'bg-purple-100 ring-1 ring-purple-400' : ''
                                    }`}
                                    title={icon.label}
                                    aria-label={icon.label}
                                >
                                    <img
                                        src={icon.src}
                                        alt={icon.label}
                                        className="w-6 h-6 object-contain"
                                    />
                                </button>
                            );
                        })}
                        {hasSelectedIcon && (
                            <>
                                <div className="w-full border-t border-gray-200 my-1"></div>
                                <button
                                    type="button"
                                    onClick={handleRemoveIcon}
                                    className="w-full text-left p-1.5 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                    ✕ Icoon verwijderen
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
