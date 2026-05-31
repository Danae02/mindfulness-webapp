import LockIcon from "@/Icons/LockIcon";

export default function CourseCard({ course, onClick, onKeyDown }) {
    const isAvailable = course.available !== false;

    if (!isAvailable) {
        return (
            <div
                className="flex items-center gap-4 p-4 bg-white rounded-xl"
                style={{
                    border: "2px solid #000000",
                    cursor: "not-allowed",
                    backgroundColor: "#F9FAFB",
                }}
                role="listitem"
            >
                <p className="sr-only">
                    {`Deel: ${course.course_name}: nog niet beschikbaar. ${course.available_label ? course.available_label + '. ' : ''}Dit deel wordt ontgrendeld als je elke dag een oefening doet.`}
                </p>
                <div
                    className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#F3F4F6", border: "2px solid #000000" }}
                    aria-hidden="true"
                >
                    <LockIcon className="w-7 h-7 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0" aria-hidden="true">
                    <p className="text-base font-bold text-gray-500">
                        {course.course_name}
                    </p>
                    <p className="text-sm text-gray-500">
                        {course.available_label || "Maak eerst het vorige deel af"}
                    </p>
                </div>
                <LockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" aria-hidden="true"/>
            </div>
        );
    }

    return (
        <div role="listitem">
            <div
                className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#5C3D8A] focus:ring-offset-2"
                style={{ border: "2px solid #5C3D8A" }}
                onClick={() => onClick(course)}
                onKeyDown={(e) => onKeyDown(e, course)}
                tabIndex={0}
                role="button"
                aria-label={`${course.course_name} – ${course.exercises?.length || 0} ${course.exercises?.length === 1 ? 'oefening' : 'oefeningen'}. Klik om de oefeningen te bekijken.`}
            >
                <div
                    className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#F0E8FF", border: "2px solid #5C3D8A" }}
                    aria-hidden="true"
                >
                    <img
                        src="/icons/lotus.png"
                        alt=""
                        aria-hidden="true"
                        className="w-10 h-10 object-contain"
                        style={{ filter: "invert(35%) sepia(40%) saturate(500%) hue-rotate(240deg) brightness(80%)" }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-base font-bold" style={{ color: "#5C3D8A" }}>
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
                    <p className="text-sm mt-1.5 font-semibold" style={{ color: "#5C3D8A" }}>
                        Bekijk oefeningen →
                    </p>
                </div>

                <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#5C3D8A" }}
                    aria-hidden="true"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
