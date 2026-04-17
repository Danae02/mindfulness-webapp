// Components/LoadingSpinner.jsx

export default function LoadingIndicator({ message = "Laden...", size = "md", fullPage = false }) {
    // Grootte opties
    const sizes = {
        sm: "h-6 w-6",
        md: "h-12 w-12",
        lg: "h-16 w-16",
        xl: "h-24 w-24"
    };

    // Tekst grootte opties
    const textSizes = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl"
    };

    const indicator = (
        <div className="flex flex-col items-center justify-center">
            <div
                className={`${sizes[size]} animate-spin rounded-full border-b-2`}
                style={{ borderColor: "#6C4092" }}
            ></div>
            {message && (
                <p className={`mt-4 text-gray-500 ${textSizes[size]}`}>
                    {message}
                </p>
            )}
        </div>
    );

    // Als fullPage waar is, center de indicator in het hele scherm
    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                {indicator}
            </div>
        );
    }

    return indicator;
}
