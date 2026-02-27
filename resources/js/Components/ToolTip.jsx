import { useState} from "react";

export default function ToolTip({ children }) {
    const [isVisible, setIsVisible ] = useState(false);

    return (
        <>
            <div className="relative flex items-center">
                <button
                    className="w-5 h-5 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-300 focus:outline-none"
                    onMouseEnter={() => setIsVisible(true)}
                    onMouseLeave={() => setIsVisible(false)}
                >
                    ?
                </button>
                {isVisible && (
                    <div className="absolute left-6 bottom-0 w-64 bg-black text-white text-sm rounded-lg p-3 shadow-lg z-10">
                        {children}
                    </div>
                )}
            </div>

        </>
    )
}
