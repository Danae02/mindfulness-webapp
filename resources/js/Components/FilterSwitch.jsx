import ToolTip from "@/Components/ToolTip.jsx";

export default function FilterSwitch({ filtered, onToggle }) {
    return (
        <label
            htmlFor="filter-reviewed"
            className="flex items-center gap-2 cursor-pointer select-none"
        >
            <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                Filter niet-gereviewd
                <ToolTip>
                    Schakel deze knop om te zien welke gebruikers er nog moeten worden gereviewd.
                </ToolTip>
            </span>

            <input
                id="filter-reviewed"
                type="checkbox"
                checked={filtered}
                onChange={onToggle}
                className="sr-only"
            />

            {/* Toggle track */}
            <span
                aria-hidden="true"
                className="relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 transition-colors duration-200"
                style={{
                    backgroundColor: filtered ? '#6C4092' : '#ffffff',
                    borderColor: filtered ? '#6C4092' : '#374151',
                }}
            >
                {/* Toggle knob */}
                <span
                    className="inline-block h-4 w-4 transform rounded-full transition-transform duration-200"
                    style={{
                        backgroundColor: filtered ? '#ffffff' : '#374151',
                        transform: filtered ? 'translateX(1.35rem)' : 'translateX(0.2rem)',
                    }}
                />
            </span>

            <span className="text-sm font-medium text-gray-800">
                {filtered ? 'Aan' : 'Uit'}
            </span>
        </label>
    );
}
