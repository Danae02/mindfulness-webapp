export default function WarningIcon({ className = "", size = "w-14 h-14" }) {
    return (
        <div
            className="flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{backgroundColor: '#FECACA'}}
            aria-hidden="true"
        >
            <svg
                viewBox="0 0 24 24"
                className="w-14 h-14"
                fill="none"
                stroke="#991B1B"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        </div>
    );
}
