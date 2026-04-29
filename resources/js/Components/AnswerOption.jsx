export default function AnswerOption({ id, name, text, icon, isSelected, onChange }) {
    return (
        <label
            htmlFor={id}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all"
            style={{
                borderColor: isSelected ? '#7B5EA7' : '#D1C4E9',
                backgroundColor: isSelected ? '#F5F0FF' : '#FFFFFF',
            }}
        >
            <input
                type="radio"
                id={id}
                name={name}
                value={text}
                onChange={onChange}
                className="sr-only"
            />
            {icon?.src && (
                <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{ width: '70px', height: '70px', backgroundColor: '#F0E8FF' }}
                >
                    <img
                        src={icon.src}
                        alt={icon.label}
                        className="object-contain"
                        style={{ width: '50px', height: '50px' }}
                    />
                </div>
            )}
            <span className="text-base font-semibold text-gray-800">{text}</span>
        </label>
    );
}
