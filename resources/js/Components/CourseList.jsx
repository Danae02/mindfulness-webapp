import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

// Beschrijving nog toevoegen
// nieuw vandaag + op slot oefeningen nog toevoegen

function CourseModal({ course, onClose }) {
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);
    const { auth } = usePage().props;
    const [favorites, setFavorites] = useState([]);

    // Nieuw: laad favorieten van de gebruiker
    useEffect(() => {
        if (auth.user) {
            fetchFavorites();
        }
    }, [auth.user]);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(route('favorites.index'));
            setFavorites(response.data.map(f => f.id));
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        }
    };

    const toggleFavorite = async (exerciseId) => {
        try {
            const response = await axios.post(route('favorites.toggle'), { exercise_id: exerciseId });

            if (response.data.is_favorite) {
                setFavorites([...favorites, exerciseId]);
            } else {
                setFavorites(favorites.filter(id => id !== exerciseId));
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    const isFavorite = (exerciseId) => {
        return favorites.includes(exerciseId);
    };

    // Focus trap
    useEffect(() => {
        const previousFocus = document.activeElement;
        closeButtonRef.current?.focus();

        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab") return;

            const focusable = Array.from(modalRef.current?.querySelectorAll(focusableSelectors) || []);
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
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
                onClick={(e) => e.stopPropagation()}
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
                        style={{ backgroundColor: '#1a1a1a' }}
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
                    {course.exercises.map((exercise) => {
                        const exerciseIsFavorite = isFavorite(exercise.id);

                        return (
                            <div
                                key={exercise.id}
                                className="rounded-xl p-5"
                                style={{ backgroundColor: '#F0E8FF', border: '1.5px solid #D4C5F0' }}
                            >
                                {/* Naam + badge */}
                                <div className="flex items-start justify-between gap-3 mb-1">
                                    <p className="text-base font-bold text-darkGray">
                                        {exercise.exercise_name}
                                    </p>
                                </div>

                                {/* Tijdsindicatie */}
                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Ongeveer {exercise.duration || 5} minuten</span>
                                </div>

                                {/* Beschrijving */}
                                {exercise.description && (
                                    <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                                )}

                                {/* Knoppen */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Link
                                        href={`/exercises/${exercise.id}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
                                        style={{ backgroundColor: '#7B5EA7' }}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        Start oefening
                                    </Link>

                                    <button
                                        onClick={() => toggleFavorite(exercise.id)}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7] ${
                                            exerciseIsFavorite
                                                ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                                                : 'bg-white text-[#7B5EA7] border-[#7B5EA7]'
                                        }`}
                                        aria-label={exerciseIsFavorite ? `Verwijder ${exercise.exercise_name} uit favorieten` : `Voeg ${exercise.exercise_name} toe aan favorieten`}
                                    >
                                        <svg className="w-4 h-4" fill={exerciseIsFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        {exerciseIsFavorite ? "Favoriet ✓" : "Favoriet"}
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
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(route("courses.get.all"));
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            }
        };
        fetchCourses();
    }, []);

    const handleCardClick = async (courseId) => {
        try {
            const response = await axios.get(route("courses.details", { id: courseId }));
            setSelectedCourse(response.data); // Zet de volledige cursusdata
            setShowModal(true); // Open de modal
        } catch (error) {
            console.error("Failed to fetch course details:", error);
        }
    };

    const handleKeyDown = (e, courseId) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(courseId);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-darkGray mb-4" id="courses-heading">
                Mindfulness oefeningen
            </h2>

            <div className="flex flex-col gap-3" role="list" aria-labelledby="courses-heading">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                        style={{ border: '2px solid #7B5EA7' }}
                        onClick={() => handleCardClick(course.id)}
                        onKeyDown={(e) => handleKeyDown(e, course.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Open cursus: ${course.course_name}, ${course.exercises?.length || 0} oefeningen`}
                    >
                        <div
                            className="flex items-center justify-center w-14 h-14 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: '#F0E8FF', border: '2px solid #7B5EA7' }}
                            aria-hidden="true"
                        >
                            <img
                                src="/icons/lotus.png"
                                alt=""
                                aria-hidden="true"
                                className="w-10 h-10 object-contain"
                                style={{ filter: 'invert(35%) sepia(40%) saturate(500%) hue-rotate(240deg) brightness(80%)' }}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-base font-bold" style={{ color: '#7B5EA7' }}>
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
                ))}
            </div>

            {showModal && selectedCourse && (
                <CourseModal course={selectedCourse} onClose={closeModal} />
            )}
        </>
    );
}
