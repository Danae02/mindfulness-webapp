import ToolTip from "@/Components/ToolTip.jsx";

export default function FilterSwitch({ filtered, onToggle }) {
    return (
        <label className="flex items-center cursor-pointer">
            <span className="mr-2 flex items-center">
                Filter reviewed
                <ToolTip>
                    Schakel deze knop om, om te zien welke gebruikers er nog moeten worden "gereviewd".
                </ToolTip>
            </span>
            <input
                type="checkbox"
                checked={filtered}
                onChange={onToggle} // Toggle filterstatus
                className="w-10 h-5 bg-gray-300 rounded-full cursor-pointer"
            />
            <span className="ml-2">{filtered ? 'On' : 'Off'}</span>
        </label>
    );
}
