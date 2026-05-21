import LockIcon from "@/Icons/LockIcon";

export default function CourseCard({ course, onClick, onKeyDown }) {
    const isAvailable = course.available !== false;

    if (!isAvailable) {
        return (
            <li
                className="flex items-center gap-4 p-4 bg-white rounded-xl"
                style={{
                    border: "2px solid #D1D5DB",
                    cursor: "not-allowed",
                    backgroundColor: "#F9FAFB",
                }}
                aria-label={`Deel ${course.course_name}: vergrendeld. ${
                    course.available_label
                        ? course.available_label + '.'
                        : 'Nog niet beschikbaar.'
                } Doe elke dag een oefening om verder te kunnen gaan.`}
            >
                {/* Alle visuele inhoud verbergen voor screenreader — aria-label op <li> doet het werk */}
                <div
                    className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#F3F4F6", border: "2px solid #D1D5DB" }}
                    aria-hidden="true"
                >
                    <LockIcon className="w-7 h-7 text-gray-400" style={{ transform: 'scale(var(--icon-scale, 1))' }} />
                </div>
                <div className="flex-1 min-w-0" aria-hidden="true">
                    <p className="text-base font-bold text-gray-500">
                        {course.course_name}
                    </p>
                    <p className="text-sm text-gray-500">
                        {course.available_label || "Nog niet beschikbaar"}
                    </p>
                </div>
                <LockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" aria-hidden="true" style={{ transform: 'scale(var(--icon-scale, 1))' }} />
            </li>
        );
    }

    return (
        <li>
            <button
                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 text-left"
                style={{ border: "2px solid #7B5EA7" }}
                onClick={() => onClick(course)}
                onKeyDown={(e) => onKeyDown(e, course)}
                aria-label={`${course.course_name}, ${course.exercises?.length || 0} ${course.exercises?.length === 1 ? 'oefening' : 'oefeningen'}. Klik om de oefeningen te bekijken.`}
            >
                <div
                    className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#F0E8FF", border: "2px solid #7B5EA7" }}
                    aria-hidden="true"
                >
                    <img
                        src="/icons/lotus.png"
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 object-contain"
                        style={{
                            filter: "invert(35%) sepia(40%) saturate(500%) hue-rotate(240deg) brightness(80%)",
                            transform: 'scale(var(--icon-scale, 1))',
                            transformOrigin: 'center',
                            transition: 'transform 0.2s ease'
                        }}
                    />
                </div>

                <div className="flex-1 min-w-0" aria-hidden="true">
                    <p className="text-base font-bold" style={{ color: "#7B5EA7" }}>
                        {course.course_name}
                    </p>
                    {course.description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                            {course.description}
                        </p>
                    )}
                    <p className="text-sm text-gray-600 mt-0.5">
                        {course.exercises?.length || 0} {course.exercises?.length === 1 ? 'oefening' : 'oefeningen'}
                    </p>
                    <p className="text-sm mt-1.5 font-semibold" style={{ color: "#7B5EA7" }}>
                        Bekijk oefeningen →
                    </p>
                </div>

                <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#7B5EA7" }}
                    aria-hidden="true"
                >
                    <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                            transform: 'scale(var(--icon-scale, 1))',
                            transformOrigin: 'center',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </button>
        </li>
    );
}
