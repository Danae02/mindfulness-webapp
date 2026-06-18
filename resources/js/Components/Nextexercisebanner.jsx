import { Link } from "@inertiajs/react";

export default function NextExerciseBanner({ nextExercise, completedTodayIds = [] }) {

    // Geen oefening beschikbaar
    if (!nextExercise) {
        return (
            <section
                role="region"
                aria-label="Status dagelijkse oefening: alle oefeningen zijn gedaan"
                className="rounded-2xl px-6 py-5 mb-5"
                style={{ backgroundColor: "#F0FDF4", border: "4px solid #0A7431" }}
            >
                <p className="text-lg font-semibold mb-1" style={{ color: "#0A7431" }}>
                    Je hebt de oefening van vandaag gedaan!
                </p>
            </section>
        );
    }

    const doneToday = completedTodayIds.includes(nextExercise.id);


    // Oefening al gedaan vandaag
    if (doneToday) {
        return (
            <section
                role="region"
                aria-label="Status dagelijkse oefening: vandaag gedaan"
                className="rounded-2xl px-6 py-5 mb-5"
                style={{ backgroundColor: "#F0FDF4", border: "4px solid #0A7431" }}
            >
                <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "#0A7431" }}
                >
                    Gedaan vandaag ✓
                </p>
                <p className="text-lg font-semibold mb-1" style={{ color: "#0A7431" }}>
                    {nextExercise.exercise_name}
                </p>
                <p className="text-sm" style={{ color: "#0A7431" }}>
                    Goed gedaan! Kom morgen terug voor je volgende oefening.
                </p>
            </section>
        );
    }

    // Oefening beschikbaar
    return (
        <section
            role="region"
            aria-label="Nieuwe oefening van vandaag"
            className="rounded-2xl px-6 py-3 mb-5"
            style={{ backgroundColor: "#F0E8FF", border: "3.5px solid #6C4092" }}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <svg width="18" height="18" fill="#6C4092" viewBox="0 0 24 24" aria-hidden="true" role="presentation" >
                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z"/>
                        </svg>
                        <p
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: "#6C4092" }}
                        >
                            Nieuwe oefening van vandaag:
                        </p>
                    </div>
                    <p className="text-lg font-semibold truncate" style={{ color: "#26215C" }}>
                        {nextExercise.exercise_name}
                    </p>
                </div>
                <Link
                    href={`/exercises/${nextExercise.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-base font-semibold rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-[#6C4092] focus:ring-offset-2 flex-shrink-0"
                    style={{ backgroundColor: "#6C4092" }}
                >
                    <span className="sr-only">{`Start oefening: ${nextExercise.exercise_name}`}</span>
                    <svg
                        width="18"
                        height="18"
                        fill="white"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        role="presentation"
                        focusable="false"
                    >
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span aria-hidden="true">Start nu</span>
                </Link>
            </div>
        </section>
    );
}
