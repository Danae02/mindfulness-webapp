export default function CheckIcon({ size = "medium", color = "#FFFFFF", bgColor = "#2E7D32", className = "" }) {
    const sizeConfig = {
        small: { container: "w-12 h-12", icon: "w-6 h-6" },
        medium: { container: "w-16 h-16", icon: "w-9 h-9" },
        large: { container: "w-20 h-20", icon: "w-12 h-12" }
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    return (
        <div
            className={`flex items-center justify-center rounded-full ${config.container} ${className}`}
            style={{ backgroundColor: bgColor }}
            aria-hidden="true"
        >
            <svg
                viewBox="0 0 24 24"
                className={config.icon}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M20 6 9 17l-5-5" />
            </svg>
        </div>
    );
}


