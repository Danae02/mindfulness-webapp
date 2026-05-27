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
                className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-300"
                role="article"
                aria-label={`Oefening ${exercise.exercise_name}: nog niet beschikbaar`}
                style={{ opacity: 0.6 }}
            >
                <p className="sr-only">
                    Oefening: {exercise.exercise_name}.
                    Status: nog niet beschikbaar.
                    {avail.available_label ? `Reden: ${avail.available_label}. ` : ''}
                    Deze oefening wordt ontgrendeld als je elke dag een oefening doet.
                    Deze oefening is momenteel disabled en kan niet gestart worden.
                </p>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-600" aria-hidden="false">
                        {exercise.exercise_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1" aria-hidden="false">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm-2 15l-5-5 1.41-1.41L10 12.17l7.59-7.59L19 6l-9 9z"/>
                        </svg>
                        {avail.available_label || "Nog niet beschikbaar"}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <LockIcon
                        className="w-5 h-5 text-gray-400"
                        aria-label="Gesloten – deze oefening is niet beschikbaar"
                        aria-hidden="false"
                    />
                </div>
            </div>
        );
    }

    return (
        <article
            className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-300
                hover:shadow-md hover:border-purple-300 transition-all duration-150"
            role="listitem"
            aria-label={`Oefening: ${exercise.exercise_name}${exercise.duration ? `, duur: ${exercise.duration} minuten` : ''}`}
        >
            {/* Oefening informatie */}
            <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">
                    {exercise.exercise_name}
                </h3>
                {exercise.duration && (
                    <p className="text-sm text-gray-500 mt-1" aria-hidden="false">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        Duur: {exercise.duration} minuten
                    </p>
                )}
            </div>

            {/* Start button */}
            <Link
                href={route("exercise.show", { id: exercise.id })}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#7B5EA7] text-white text-sm font-semibold
                    rounded-lg hover:bg-[#5a3a7a]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]
                    transition-colors duration-150"
                aria-label={`Start oefening: ${exercise.exercise_name}`}
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M8 5v14l11-7z" />
                </svg>
                <span aria-hidden="true">Start</span>
            </Link>

            {/* Favorite button */}
            {auth.user && (
                <button
                    onClick={() => onToggleFavorite(exercise.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
                    style={{
                        backgroundColor: '#FFFFFF',
                        border: '2.5px solid #7B5EA7',
                    }}
                    aria-label={
                        exerciseIsFav
                            ? `Verwijder ${exercise.exercise_name} uit favoriete oefeningen`
                            : `Voeg ${exercise.exercise_name} toe aan favoriete oefeningen`
                    }
                    aria-pressed={exerciseIsFav}
                    title={exerciseIsFav ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
                >
                    <svg
                        className="w-5 h-5"
                        fill={exerciseIsFav ? "#DC2626" : "none"}
                        stroke={exerciseIsFav ? "none" : "#9CA3AF"}
                        strokeWidth={exerciseIsFav ? "0" : "1.5"}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-sm font-medium" style={{ color: exerciseIsFav ? '#DC2626' : '#4B5563' }} aria-hidden="true">
                        {exerciseIsFav ? "Favoriet" : "Favoriet"}
                    </span>
                </button>
            )}
        </article>
    );
}
