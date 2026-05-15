import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import LockIcon from "@/Icons/LockIcon";
import HeartIcon from "@/Icons/HeartIcon";


//vaste introductieoefening, altijd bovenaan en altijd beschikbaar
function IntroCard({ exercise }) {
    return (
        <div className="mb-2">
            <p
                className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1"
                id="intro-label"
            >
                Begin hier
            </p>
            <Link
                href={route("exercise.show", { id: exercise.id })}
                className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                style={{ border: "2px solid #7B5EA7", textDecoration: "none" }}
            >
                <span className="sr-only">{`Start introductie-oefening: ${exercise.exercise_name}`}</span>
                <div className="flex-1 min-w-0" aria-hidden="true">
                    <p className="text-base font-bold" style={{ color: "#7B5EA7" }}>
                        {exercise.exercise_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Altijd beschikbaar
                    </p>
                </div>

                <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: "#7B5EA7" }}
                    aria-hidden="true"
                >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    Start
                </span>
            </Link>
        </div>
    );
}


// toont oefeningen van een gewone cursus
function CourseModal({ course, onClose }) {
    const modalRef       = useRef(null);
    const closeButtonRef = useRef(null);
    const { auth }       = usePage().props;

    const [favorites,    setFavorites]    = useState([]);
    const [availability, setAvailability] = useState({});
    const [loadingAvail, setLoadingAvail] = useState(true);

    //  Favorieten ophalen
    useEffect(() => {
        if (auth.user) {
            axios.get(route("favorites.index"))
                .then(res => setFavorites(res.data.map(f => f.id)))
                .catch(err => console.error("Failed to fetch favorites:", err));
        }
    }, [auth.user]);

    //  Beschikbaarheid ophalen
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
            .catch(err => {
                console.error("Failed to fetch availability:", err);
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

    // Focus trap voor toegankelijkheid
    useEffect(() => {
        const previousFocus = document.activeElement;

        const titleElement = modalRef.current?.querySelector('[id="modal-title"]');
        titleElement?.focus();

        // Maak alles buiten modal inert
        const htmlElement = document.documentElement;
        const prevAriaHidden = htmlElement.getAttribute('aria-hidden');
        htmlElement.setAttribute('aria-hidden', 'true');

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
            if (prevAriaHidden === null) {
                htmlElement.removeAttribute('aria-hidden');
            } else {
                htmlElement.setAttribute('aria-hidden', prevAriaHidden);
            }
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

                {/* Loading state */}
                {loadingAvail && (
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
                )}

                {/* Oefeningen */}
                <div className="p-6 pt-2">
                    <div className="space-y-3" role="list" aria-label={`Oefeningen in deel ${course.course_name}`}>
                        {course.exercises.map((exercise) => {
                            const avail = availability[exercise.id] || { available: true };
                            const exerciseIsFav = isFavorite(exercise.id);
                            const isDisabled = !avail.available;

                            if (isDisabled) {
                                return (
                                    <div
                                        key={exercise.id}
                                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-300"
                                        style={{ opacity: 0.6 }}
                                        role="listitem"
                                    >
                                        {/* Één template literal = één tekstelement = screenreader leest het één keer */}
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
                                    key={exercise.id}
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
                                            onClick={() => toggleFavorite(exercise.id)}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            style={{
                                                backgroundColor: exerciseIsFav ? '#fee2e2' : '#F3F4F6',
                                                color: exerciseIsFav ? '#dc2626' : '#6B7280',
                                                focusRingColor: exerciseIsFav ? '#dc2626' : '#7B5EA7'
                                            }}
                                            aria-label={
                                                exerciseIsFav
                                                    ? `Verwijder ${exercise.exercise_name} uit je favoriete oefeningen`
                                                    : `Voeg ${exercise.exercise_name} toe aan je favoriete oefeningen`
                                            }
                                            aria-pressed={exerciseIsFav}
                                            title={exerciseIsFav ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"}
                                        >
                                            {/* Hart icoon */}
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
            {exerciseIsFav ? "Favoriet" : "Favoriet"}
        </span>

                                            {/* Extra screenreader-tekst voor context */}
                                            <span className="sr-only">
            {exerciseIsFav
                ? `, ${exercise.exercise_name} is een van je favoriete oefeningen`
                : `, maak ${exercise.exercise_name} een van je favoriete oefeningen`}
        </span>
                                        </button>
                                    )}


                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function CourseList() {
    const [courses,        setCourses]        = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal,      setShowModal]      = useState(false);
    const [loading,        setLoading]        = useState(true);

    useEffect(() => {
        axios.get(route("courses.get.all"))
            .then(res => setCourses(res.data))
            .catch(err => console.error("Failed to fetch courses:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleCardClick = async (course) => {
        if (!course.available) return;
        try {
            const response = await axios.get(route("courses.details", { id: course.id }));
            setSelectedCourse(response.data);
            setShowModal(true);
        } catch (error) {
            console.error("Failed to fetch course details:", error);
        }
    };

    const handleKeyDown = (e, course) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(course);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    if (loading) {
        return (
            <div
                className="flex items-center gap-2 py-6 text-gray-400 text-sm"
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
        );
    }

    // Split de intro van de gewone cursussen
    const introCourse    = courses.find(c => c.is_intro);
    const regularCourses = courses.filter(c => !c.is_intro);

    return (
        <>
            <h2 className="text-2xl font-bold text-darkGray mb-4" id="courses-heading">
                Mindfulness oefeningen
            </h2>

            {/* Vaste introductie-oefening*/}
            {introCourse && (
                <IntroCard exercise={introCourse.exercises[0]} />
            )}

            {regularCourses.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1 mt-4">
                    Vervolg delen
                </p>
            )}
            {regularCourses.length === 0 && !introCourse && (
                <p className="text-gray-400 italic text-sm">Nog geen delen beschikbaar.</p>
            )}
            <div className="flex flex-col gap-3" role="list" aria-labelledby="courses-heading">
                {regularCourses.map((course) => {
                    const isAvailable = course.available !== false;

                    if (!isAvailable) {
                        return (
                            <div
                                key={course.id}
                                className="flex items-center gap-4 p-4 bg-white rounded-xl"
                                style={{
                                    border: "2px solid #D1D5DB",
                                    opacity: 0.65,
                                    cursor: "not-allowed",
                                }}
                                role="listitem"
                            >
                                <p className="sr-only">
                                    {`Deel: ${course.course_name}: nog niet beschikbaar. ${course.available_label ? course.available_label + '. ' : ''}Dit deel wordt ontgrendeld als je elke dag een oefening doet.`}
                                </p>
                                <div
                                    className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                                    style={{ backgroundColor: "#F3F4F6", border: "2px solid #D1D5DB" }}
                                    aria-hidden="true"
                                >
                                    <LockIcon className="w-7 h-7 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0" aria-hidden="true">
                                    <p className="text-base font-bold text-gray-600">
                                        {course.course_name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {course.available_label || "Nog niet beschikbaar"}
                                    </p>
                                </div>
                                <LockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" aria-hidden="true" />
                            </div>
                        );
                    }

                    return (
                        <div key={course.id} role="listitem">
                            <div
                                className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                                style={{ border: "2px solid #7B5EA7" }}
                                onClick={() => handleCardClick(course)}
                                onKeyDown={(e) => handleKeyDown(e, course)}
                                tabIndex={0}
                                role="button"
                                aria-label={`Open deel: ${course.course_name}, ${course.exercises?.length || 0} oefeningen`}
                            >
                                <div
                                    className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                                    style={{ backgroundColor: "#F0E8FF", border: "2px solid #7B5EA7" }}
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
                                    <p className="text-base font-bold" style={{ color: "#7B5EA7" }}>
                                        {course.course_name}
                                    </p>
                                    {course.description && (
                                        <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                                            {course.description}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {course.exercises?.length || 0} oefeningen
                                    </p>
                                </div>

                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && selectedCourse && (
                <CourseModal course={selectedCourse} onClose={closeModal} />
            )}
        </>
    );
}
