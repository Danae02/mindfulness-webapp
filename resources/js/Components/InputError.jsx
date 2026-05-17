export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-red-600 ' + className}
        >
            <span className="sr-only">Fout: </span>
            {message}
        </p>
    ) : null;
}
