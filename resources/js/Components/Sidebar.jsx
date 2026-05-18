import { useState, useRef } from 'react';

export default function Sidebar({
                                    menuItems = [],
                                    currentView = null,
                                    onViewChange = () => {},
                                    title = "Menu"
                                }) {
    const [focusedIndex, setFocusedIndex] = useState(0);
    const buttonRefs = useRef([]);

    const handleViewChange = (viewKey) => {
        onViewChange(viewKey);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (index + 1) % menuItems.length;
            setFocusedIndex(nextIndex);
            buttonRefs.current[nextIndex]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
            setFocusedIndex(prevIndex);
            buttonRefs.current[prevIndex]?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleViewChange(menuItems[index].key);
        }
    };

    return (
        <nav
            aria-label={title}
            className="w-full md:w-64 bg-[#312C50] text-white md:min-h-screen"
        >
            <div className="p-4">
                <p className="text-lg font-semibold break-words">{title}</p>
                <ul role="menu" className="mt-4 space-y-2">
                    {menuItems.map(({ key, label }, index) => (
                        <li role="none" key={key}>
                            <button
                                ref={(el) => buttonRefs.current[index] = el}
                                role="menuitem"
                                tabIndex={focusedIndex === index ? 0 : -1}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onClick={() => {
                                    setFocusedIndex(index);
                                    handleViewChange(key);
                                }}
                                aria-current={currentView === key ? "page" : undefined}
                                className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                    currentView === key
                                        ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                        : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                                }`}
                                style={currentView === key ? { boxShadow: "inset 3px 0 0 #9B6DD4" } : {}}
                            >
                                <span className="break-words">{label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
