import { Link } from "@inertiajs/react";

export default function NextExerciseBanner({ nextExercise, completedTodayIds = [] }) {

    // Geen oefening beschikbaar
    if (!nextExercise) {
        return (
            <section
                role="region"
                aria-label="Status dagelijkse oefening: alle oefeningen voltooid"
                className="rounded-2xl px-6 py-5 mb-5"
                style={{ backgroundColor: "#FEF3E8", border: "2px solid #B85B06" }}
            >
                <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "#B85B06" }}
                >
                    Klaar voor vandaag
                </p>
                <p className="text-lg font-semibold mb-1" style={{ color: "#4A2400" }}>
                    Je hebt alle oefeningen gedaan!
                </p>
                <p className="text-sm" style={{ color: "#7A3B00" }}>
                    Kom morgen terug voor je volgende oefening, of doe een oudere oefening opnieuw.
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
                aria-label="Status dagelijkse oefening: vandaag voltooid"
                className="rounded-2xl px-6 py-5 mb-5"
                style={{ backgroundColor: "#FEF3E8", border: "2px solid #B85B06" }}
            >
                <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "#B85B06" }}
                >
                    Gedaan vandaag ✓
                </p>
                <p className="text-lg font-semibold mb-1" style={{ color: "#4A2400" }}>
                    {nextExercise.exercise_name}
                </p>
                <p className="text-sm" style={{ color: "#7A3B00" }}>
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
            className="rounded-2xl px-6 py-5 mb-5"
            style={{ backgroundColor: "#F0E8FF", border: "2px solid #6C4092" }}
        >
            <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: "#6C4092" }}
            >
                Nieuwe oefening van vandaag
            </p>
            <p className="text-lg font-semibold mb-4" style={{ color: "#26215C" }}>
                {nextExercise.exercise_name}
            </p>
            <Link
                href={`/exercises/${nextExercise.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-white text-base font-semibold rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-[#6C4092] focus:ring-offset-2"
                style={{ backgroundColor: "#6C4092" }}
            >
                <span className="sr-only">{`Start oefening: ${nextExercise.exercise_name}`}</span>
                <svg
                    width="18"
                    height="18"
                    fill="white"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <span aria-hidden="true">Start nu</span>
            </Link>
        </section>
    );
}
