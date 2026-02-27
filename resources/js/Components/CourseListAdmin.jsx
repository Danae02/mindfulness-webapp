export default function CourseListAdmin({ courses, onCourseClick }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
                <div
                    key={course.id}
                    className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg"
                    onClick={() => onCourseClick(course.id)}
                >
                    <h2 className="text-lg font-bold">{course.course_name}</h2>
                    <p className="text-gray-600">Oefeningen: {course.exercises?.length || 0}</p>
                </div>
            ))}
        </div>
    );
}
