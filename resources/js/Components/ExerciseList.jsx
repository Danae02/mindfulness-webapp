import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ExerciseList({}) {
    const [course, setCourse] = useState(null);

    useEffect(() => {
        axios.get(route("courses.exercises", { id: courseId }))
            .then(response => setCourse(response.data))
            .catch(error => console.error("Error fetching exercises:", error));
    }, [courseId]);

    if (!course) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Exercises for {course.course_name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {course.exercises.map(exercise => (
                    <Link
                        key={exercise.id}
                        href={route("exercise.show", { id: exercise.id })}
                        className="p-4 bg-white rounded-lg shadow hover:shadow-lg"
                    >
                        <h2 className="text-lg font-bold">{exercise.exercise_name}</h2>
                        <p className="text-gray-600">
                            Beschrijving: {exercise.description || "Geen beschrijving"}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
