export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-[#6c4092] border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#5a337a] focus:bg-[#5a337a] active:bg-[#4a2a63] focus:outline-none focus:ring-2 focus:ring-[#6c4092] focus:ring-offset-2 transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
