import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "@inertiajs/react";

export default function CourseList() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null); // De geselecteerde cursus
    const [showModal, setShowModal] = useState(false); // Modal zichtbaar of niet

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

    const closeModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    return (
        <div className="p-6 bg-lightGray">
            <h1 className="text-3xl font-heading font-bold text-darkGray mb-8">Cursussen</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="p-6 bg-white rounded-lg shadow-card cursor-pointer hover:shadow-lg transition-shadow duration-300"
                        onClick={() => handleCardClick(course.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleCardClick(course.id); // Open bij Enter of Spatie
                        }}
                    >
                        <h2 className="text-xl font-semibold text-primary mb-2">{course.course_name}</h2>
                        <p className="text-gray-600">Oefeningen: {course.exercises?.length || 0}</p>
                    </div>
                ))}
            </div>

            {showModal && selectedCourse && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 w-11/12 max-w-4xl">
                        <h2 className="text-2xl font-heading font-bold text-darkGray mb-6">{selectedCourse.course_name}</h2>

                        <h3 className="text-lg font-semibold text-primary mb-4">Oefeningen</h3>
                        <div className="space-y-4">
                            {selectedCourse.exercises.map((exercise) => (
                                <div key={exercise.id} className="p-4 bg-gray-100 rounded-lg shadow-card">
                                    <p className="text-lg font-bold text-darkGray">{exercise.exercise_name}</p>
                                    <p className="text-sm text-gray-600">Keren gedaan: {exercise.times_done}</p>
                                    <p className="text-sm text-gray-600">Laatste keer: {exercise.last_time || 'Nog niet gedaan'}</p>
                                    <Link href={`/exercises/${exercise.id}`}>
                                        <button className="mt-4 px-4 py-2 bg-primary text-white font-medium rounded-lg shadow hover:bg-primary-dark transition-all">
                                            Start Oefening
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={closeModal}
                            className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition-all"
                        >
                            Sluiten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
