import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ExerciseRow from "@/Components/ExerciseRow";

export default function CourseModal({ course, onClose }) {
    const modalRef       = useRef(null);
    const closeButtonRef = useRef(null);

    const [favorites,    setFavorites]    = useState([]);
    const [availability, setAvailability] = useState({});
    const [loadingAvail, setLoadingAvail] = useState(true);

    // Favorieten ophalen
    useEffect(() => {
        axios.get(route("favorites.index"))
            .then(res => setFavorites(res.data.map(f => f.id)))
            .catch(err => console.error("Failed to fetch favorites:", err));
    }, []);

    // Beschikbaarheid ophalen
    useEffect(() => {
        setLoadingAvail(true);
        axios.get(route("courses.availability", { id: course.id }))
            .then(res => {
                const map = {};
                res.data.forEach(item => {
                    map[item.exercise_id] = {
                        available:       item.available,
                        available_label: item.available_label,
                        available_from:  item.available_from,
                    };
                });
                setAvailability(map);
            })
            .catch(() => {
                // Bij fout: alles als beschikbaar zodat de app niet breekt
                const fallback = {};
                course.exercises.forEach(ex => {
                    fallback[ex.id] = { available: true, available_label: null, available_from: null };
                });
                setAvailability(fallback);
            })
            .finally(() => setLoadingAvail(false));
    }, [course.id]);

    const toggleFavorite = async (exerciseId) => {
        try {
            const response = await axios.post(route("favorites.toggle"), { exercise_id: exerciseId });
            if (response.data.is_favorite) {
                setFavorites(prev => [...prev, exerciseId]);
            } else {
                setFavorites(prev => prev.filter(id => id !== exerciseId));
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    const isFavorite = (exerciseId) => favorites.includes(exerciseId);

    // Telling voor screenreader samenvatting
    const totalExercises     = course.exercises.length;
    const lockedExercises    = course.exercises.filter(
        ex => availability[ex.id] && !availability[ex.id].available
    ).length;
    const availableExercises = totalExercises - lockedExercises;

    // Focus trap voor toegankelijkheid
    useEffect(() => {
        const previousFocus = document.activeElement;
        const titleElement  = modalRef.current?.querySelector('[id="modal-title"]');
        titleElement?.focus();


        const focusableSelectors =
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const handleKeyDown = (e) => {
            if (e.key === "Escape") { onClose(); return; }
            if (e.key !== "Tab") return;

            const focusable = Array.from(
                modalRef.current?.querySelectorAll(focusableSelectors) || []
            );
            const first = focusable[0];
            const last  = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocus?.focus();
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto"
                role="document"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2">
                    <h2 id="modal-title" className="text-2xl font-bold text-darkGray" tabIndex={-1}>
                        {course.course_name}
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
                        style={{ backgroundColor: "#1a1a1a" }}
                        aria-label="Sluit dialoogvenster"
                    >
                        <span aria-hidden="true">✕</span>
                        Sluiten
                    </button>
                </div>

                {/* Beschrijving */}
                {course.description && (
                    <p className="px-6 pb-3 text-sm text-gray-500 leading-relaxed">
                        {course.description}
                    </p>
                )}

                {/* Pas renderen als availability bekend is */}
                {loadingAvail ? (
                    <div
                        className="flex items-center gap-2 py-6 px-6 text-gray-400 text-sm"
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                    >
                        <svg className="animate-spin h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Oefeningen laden…
                    </div>
                ) : (
                    <div className="p-6 pt-2">

                        <p className="sr-only" aria-live="polite">
                            {`Dit deel bevat ${totalExercises} oefeningen: ${availableExercises} beschikbaar${
                                lockedExercises > 0
                                    ? ` en ${lockedExercises} nog niet te doen. Doe elke dag een oefening, dan komen er meer vrij.`
                                    : '.'
                            }`}
                        </p>

                        <div className="space-y-3" role="list" aria-label={`Oefeningen in deel ${course.course_name}`}>
                            {course.exercises.map((exercise) => (
                                <ExerciseRow
                                    key={exercise.id}
                                    exercise={exercise}
                                    availability={availability}
                                    isFavorite={isFavorite}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
