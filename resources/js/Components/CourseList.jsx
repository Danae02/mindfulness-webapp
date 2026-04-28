import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import LockIcon from "@/Icons/LockIcon";
import HeartIcon from "@/Icons/HeartIcon";
import { isToday } from "@/Utils/dateUtils";


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

    //  Focus trap voor toegankelijkheid
    useEffect(() => {
        const previousFocus = document.activeElement;
        closeButtonRef.current?.focus();

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
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2">
                    <h2 id="modal-title" className="text-2xl font-bold text-darkGray">
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

                {/* Subtitel */}
                <p className="px-6 pb-4 text-base font-semibold" style={{ color: '#7B5EA7' }}>
                    Oefeningen in deze cursus
                </p>

                {/* Oefeningen */}
                <div className="px-6 pb-6 flex flex-col gap-4">
                    {loadingAvail ? (
                        course.exercises.map((exercise) => (
                            <div
                                key={exercise.id}
                                className="rounded-xl p-5 animate-pulse"
                                style={{ backgroundColor: "#F3F0F8", border: "1.5px solid #E8E0F0", minHeight: "80px" }}
                                aria-hidden="true"
                            >
                                <div className="h-4 bg-purple-100 rounded w-1/2 mb-3" />
                                <div className="h-3 bg-purple-50 rounded w-1/3" />
                            </div>
                        ))
                    ) : course.exercises.map((exercise) => {
                        const avail          = availability[exercise.id];
                        const isAvailable    = avail?.available ?? false;
                        const availableLabel = avail?.available_label ?? null;
                        const availableFrom  = avail?.available_from ?? null;
                        const exerciseIsFav  = isFavorite(exercise.id);

                        if (!isAvailable) {
                            // Niet beschikbare oefening
                            return (
                                <div
                                    key={exercise.id}
                                    className="rounded-xl p-5"
                                    style={{
                                        backgroundColor: "#F8F8F8",
                                        border: "1.5px solid #E0E0E0",
                                        opacity: 0.75,
                                    }}
                                    aria-label={`${exercise.exercise_name} — nog niet beschikbaar`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-base font-bold text-gray-500">
                                                {exercise.exercise_name}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Ongeveer {exercise.duration || 5} minuten</span>
                                            </div>
                                            {availableLabel && (
                                                <p className="text-sm text-gray-400 mt-2 font-medium">
                                                    {availableLabel}
                                                </p>
                                            )}
                                        </div>
                                        <div
                                            className="flex-shrink-0 flex items-center justify-center rounded-xl"
                                            style={{ width: "52px", height: "52px", backgroundColor: "#EEEEEE" }}
                                            aria-hidden="true"
                                        >
                                            <LockIcon className="w-6 h-6 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Beschikbare oefening
                        return (
                            <div
                                key={exercise.id}
                                className="rounded-xl p-5"
                                style={{
                                    backgroundColor: "#F0E8FF",
                                    border: "1.5px solid #D4C5F0",
                                }}
                            >
                                <div className="flex items-start justify-between gap-3 mb-1">
                                    <p className="text-base font-bold text-darkGray">
                                        {exercise.exercise_name}
                                    </p>
                                    {availableFrom && isToday(availableFrom) && (
                                        <span
                                            className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ backgroundColor: "#7B5EA7", color: "#fff" }}
                                        >
                                            Nieuw vandaag!
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Ongeveer {exercise.duration || 5} minuten</span>
                                </div>

                                {exercise.description && (
                                    <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                                )}

                                <div className="flex items-center gap-3 flex-wrap mt-3">
                                    <Link
                                        href={`/exercises/${exercise.id}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
                                        style={{ backgroundColor: "#7B5EA7" }}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        Start oefening
                                    </Link>

                                    <button
                                        onClick={() => toggleFavorite(exercise.id)}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7] ${
                                            exerciseIsFav
                                                ? "text-white border-[#7B5EA7]"
                                                : "bg-white text-[#7B5EA7] border-[#7B5EA7]"
                                        }`}
                                        style={exerciseIsFav ? { backgroundColor: "#7B5EA7" } : {}}
                                        aria-label={
                                            exerciseIsFav
                                                ? `Verwijder ${exercise.exercise_name} uit favorieten`
                                                : `Voeg ${exercise.exercise_name} toe aan favorieten`
                                        }
                                    >
                                        <HeartIcon filled={exerciseIsFav} className="w-4 h-4" />
                                        {exerciseIsFav ? "Favoriet ✓" : "Favoriet"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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
            <div className="flex items-center gap-2 py-6 text-gray-400 text-sm">
                <svg className="animate-spin h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cursussen laden…
            </div>
        );
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-darkGray mb-4" id="courses-heading">
                Mijn cursussen
            </h2>

            {courses.length === 0 && (
                <p className="text-gray-400 italic text-sm">Nog geen cursussen beschikbaar.</p>
            )}

            <div className="flex flex-col gap-3" role="list" aria-labelledby="courses-heading">
                {courses.map((course) => {
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
                                aria-label={`Cursus ${course.course_name} — nog niet beschikbaar`}
                            >
                                <div
                                    className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                                    style={{ backgroundColor: "#F3F4F6", border: "2px solid #D1D5DB" }}
                                    aria-hidden="true"
                                >
                                    <LockIcon className="w-7 h-7 text-gray-400" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-gray-400">
                                        {course.course_name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {course.available_label || "Nog niet beschikbaar"}
                                    </p>
                                </div>

                                <LockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                            </div>
                        );
                    }

                    return (
                        <div
                            key={course.id}
                            className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                            style={{ border: "2px solid #7B5EA7" }}
                            onClick={() => handleCardClick(course)}
                            onKeyDown={(e) => handleKeyDown(e, course)}
                            tabIndex={0}
                            role="button"
                            aria-label={`Open cursus: ${course.course_name}, ${course.exercises?.length || 0} oefeningen`}
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
                                <p className="text-sm text-gray-500">
                                    {course.exercises?.length || 0} oefeningen
                                </p>
                            </div>

                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
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
