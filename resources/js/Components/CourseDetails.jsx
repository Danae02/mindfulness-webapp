export default function CourseDetails({ course }) {
    if (!course) {
        return <p>Loading...</p>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">{course.course_name}</h1>
            <h2 className="text-xl font-semibold mb-4">Exercises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.exercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        className="p-4 bg-white rounded-lg shadow"
                    >
                        <h3 className="text-lg font-bold">{exercise.exercise_name}</h3>
                        <p className="text-gray-600">Path: {exercise.audio_file_path}</p>
                        <p className="text-gray-600">Times Done: {exercise.times_done}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
