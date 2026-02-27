export default function SmallExerciseCard({ exercise }) {
    return (
        <>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">{exercise.exercise_name}</h3>
                <p className="text-sm text-gray-500">Keywords: {exercise.keywords}</p>
            </div>
        </>
    )
}
