import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";
import CourseCard  from "@/Components/CourseCard";
import ClientCourseModal from "@/Components/ClientCourseModal";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

// Vaste introductieoefening is altijd bovenaan en altijd beschikbaar
function IntroCard({ exercise }) {
    return (
        <div className="mb-2">
            <p
                className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2 px-1"
                id="intro-label"
            >
                Begin hier
            </p>
            <Link
                href={route("exercise.show", { id: exercise.id })}
                className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                style={{ border: "2px solid #7B5EA7", textDecoration: "none" }}
            >
                <span className="sr-only">{`Introductie-oefening: ${exercise.exercise_name}. Klik om direct naar de oefening te gaan.`}</span>
                <div className="flex-1 min-w-0" aria-hidden="true">
                    <p className="text-base font-bold" style={{ color: "#7B5EA7" }}>
                        {exercise.exercise_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Klik om de oefening te starten
                    </p>
                </div>
                <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: "#7B5EA7" }}
                    aria-hidden="true"
                >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    Start
                </span>
            </Link>
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

    //if (loading) return <LoadingSpinner />;
    if (loading) return <LoadingIndicator message="Oefeningen laden…" />;

    const introCourse    = courses.find(c => c.is_intro);
    const regularCourses = courses.filter(c => !c.is_intro);

    return (
        <>
            <h2 className="text-2xl font-bold text-darkGray mb-4" id="courses-heading">
                <span lang="en">Mindfulness</span> oefeningen
            </h2>

            {introCourse && (
                <IntroCard exercise={introCourse.exercises[0]} />
            )}

            {regularCourses.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2 px-1 mt-4">
                    Vervolg delen
                </p>
            )}

            {regularCourses.length === 0 && !introCourse && (
                <p className="text-gray-400 italic text-sm">Nog geen delen beschikbaar.</p>
            )}

            <div className="flex flex-col gap-3" role="list" aria-labelledby="courses-heading">
                {regularCourses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        onClick={handleCardClick}
                        onKeyDown={handleKeyDown}
                    />
                ))}
            </div>

            {showModal && selectedCourse && (
                <ClientCourseModal course={selectedCourse} onClose={closeModal} />
            )}
        </>
    );
}
