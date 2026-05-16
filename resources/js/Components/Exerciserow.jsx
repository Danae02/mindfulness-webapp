import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import LockIcon from "@/Icons/LockIcon";

export default function ExerciseRow({ exercise, availability, isFavorite, onToggleFavorite }) {
    const { auth } = usePage().props;
    const avail      = availability[exercise.id] || { available: true };
    const isDisabled = !avail.available;
    const exerciseIsFav = isFavorite(exercise.id);

    if (isDisabled) {
        return (
            <div
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-300"
                style={{ opacity: 0.6 }}
                role="listitem"
            >
                <p className="sr-only">
                    {`Oefening ${exercise.exercise_name}: nog niet beschikbaar. ${avail.available_label ? avail.available_label + '. ' : ''}Deze oefening wordt ontgrendeld als je elke dag een oefening doet.`}
                </p>
                <div className="flex-1 min-w-0" aria-hidden="true">
                    <p className="text-base font-semibold text-gray-600">
                        {exercise.exercise_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {avail.available_label || "Nog niet beschikbaar"}
                    </p>
                </div>
                <LockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" aria-hidden="true" />
            </div>
        );
    }

    return (
        <article
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-300 hover:shadow-md transition-shadow"
            role="listitem"
        >
            <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900">
                    {exercise.exercise_name}
                </p>
                {exercise.duration && (
                    <p className="text-sm text-gray-500 mt-1">
                        Duur: {exercise.duration} minuten
                    </p>
                )}
            </div>

            <Link
                href={route("exercise.show", { id: exercise.id })}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#7B5EA7] text-white text-sm font-semibold rounded-lg hover:bg-[#5a3a7a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
            >
                <span className="sr-only">{`Start oefening: ${exercise.exercise_name}`}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M8 5v14l11-7z" />
                </svg>
                <span aria-hidden="true">Start</span>
            </Link>

            {auth.user && (
                <button
                    onClick={() => onToggleFavorite(exercise.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                        backgroundColor: exerciseIsFav ? '#fee2e2' : '#F3F4F6',
                        color: exerciseIsFav ? '#dc2626' : '#6B7280',
                    }}
                    aria-label={
                        exerciseIsFav
                            ? `Verwijder ${exercise.exercise_name} uit je favoriete oefeningen`
                            : `Voeg ${exercise.exercise_name} toe aan je favoriete oefeningen`
                    }
                    aria-pressed={exerciseIsFav}
                    title={exerciseIsFav ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
                >
                    <svg
                        className="w-4 h-4"
                        fill={exerciseIsFav ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={exerciseIsFav ? "0" : "1.5"}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-sm font-medium" aria-hidden="true">
                        Favoriet
                    </span>
                    <span className="sr-only">
                        {exerciseIsFav
                            ? `, ${exercise.exercise_name} is een van je favoriete oefeningen`
                            : `, maak ${exercise.exercise_name} een van je favoriete oefeningen`}
                    </span>
                </button>
            )}
        </article>
    );
}
