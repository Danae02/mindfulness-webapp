export default function ExerciseCard({exercise, onEdit}) {

    return (
        <div className="p-2 bg-gray-100 rounded shadow">
            <p className="font-bold">{exercise.exercise_name}</p>
            <p className="text-sm text-gray-600">Bestand: {exercise.audio_file_path}</p>
            <p className="text-sm text-gray-600">Times Done: {exercise.times_done}</p>
            <p className="text-sm text-gray-600">Laatste keer: {exercise.last_time || 'Nog niet gedaan'}</p>
            <button
                onClick={onEdit}
                className="mt-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded shadow hover:bg-yellow-600"
            >
                Bewerk oefening
            </button>
        </div>
    );
}
