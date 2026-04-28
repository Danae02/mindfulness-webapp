// CourseModal.jsx
import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import ExerciseEditor from "./ExerciseEditor";
import CourseNameEditor from "./CourseNameEditor";

export default function CourseModal({ course, onClose, onEditCourseName, onDeleteCourse, onEditExercise }) {
    const [editingExercise, setEditingExercise] = useState(null);

    const handleSaveExercise = (updatedExercise) => {
        onEditExercise(updatedExercise);
        setEditingExercise(null);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-3xl">
                <CourseNameEditor
                    courseName={course.course_name}
                    onSave={onEditCourseName}
                />

                <h3 className="text-lg font-semibold mb-2">Oefeningen</h3>
                <div className="space-y-2">
                    {course.exercises.map((exercise) => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onEdit={() => setEditingExercise(exercise)}
                        />
                    ))}
                </div>

                {editingExercise && (
                    <ExerciseEditor
                        exercise={editingExercise}
                        onSave={handleSaveExercise}
                        onCancel={() => setEditingExercise(null)}
                    />
                )}

                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700">
                        Sluiten
                    </button>
                    <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
                    >
                        Verwijderen
                    </button>
                </div>
            </div>
        </div>
    );
}
