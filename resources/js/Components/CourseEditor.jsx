import {useEffect, useState} from "react";
import CourseListAdmin from "@/Components/CourseListAdmin.jsx";
import CourseModal from "@/Components/CourseModal.jsx";

export default function CourseEditor() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Ophalen van cursussen
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

    // Event handlers
    const handleCourseClick = async (courseId) => {
        try {
            const response = await axios.get(route("courses.details", { id: courseId }));
            setSelectedCourse(response.data);
        } catch (error) {
            console.error("Failed to fetch course details:", error);
        }
    };

    const handleEditCourseName = async (newName) => {
        try {
            await axios.put(route("courses.update", { id: selectedCourse.id, course_name: newName }));
            setCourses((prev) => prev.map((course) => (
                course.id === selectedCourse.id ? { ...course, course_name: newName } : course
            )));
            setSelectedCourse({ ...selectedCourse, course_name: newName });
        } catch (error) {
            console.error("Failed to edit course name:", error);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            await axios.delete(route("courses.delete", { id: courseId }));
            setCourses((prev) => prev.filter((course) => course.id !== courseId));
            setSelectedCourse(null);
        } catch (error) {
            console.error("Failed to delete course:", error);
        }
    };

    const handleEditExercise = async (updatedExercise) => {
        try {
            // FormData gebruiken om bestanden te versturen
            const formData = new FormData();
            formData.append("exercise_name", updatedExercise.exercise_name);
            formData.append("form_question", updatedExercise.form_question);
            updatedExercise.form_answers.forEach((answer, index) => {
                formData.append(`form_answers[${index}]`, answer);
            });

            if (updatedExercise.newFile) {
                formData.append("audio", updatedExercise.newFile);
            }

            console.log(formData)

            // API-aanroep om de oefening bij te werken
            const response = await axios.put(route("exercises.update", { id: updatedExercise.id }), formData , {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                alert("Oefening succesvol bijgewerkt!");
                // Werk de lijst met oefeningen bij
                setSelectedCourse((prevCourse) => ({
                    ...prevCourse,
                    exercises: prevCourse.exercises.map((exercise) =>
                        exercise.id === updatedExercise.id ? response.data.exercise : exercise
                    ),
                }));
            } else {
                alert("Fout bij het bijwerken van de oefening.");
            }
        } catch (error) {
            console.error("Fout bij het bijwerken van de oefening:", error);
            alert("Er ging iets mis bij het opslaan.");
        }
    };


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Cursussen</h1>
            <CourseListAdmin courses={courses} onCourseClick={handleCourseClick} />
            {selectedCourse && (
                <CourseModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onEditCourseName={handleEditCourseName}
                    onDeleteCourse={handleDeleteCourse}
                    onEditExercise={handleEditExercise}
                />
            )}
        </div>
    );
}



// import { useEffect, useState } from "react";
// import axios from "axios";
// import AudioControl from "@/Components/AudioControl.jsx";
//
// export default function CourseEditor() {
//     const [courses, setCourses] = useState([]);
//     const [selectedCourse, setSelectedCourse] = useState(null);
//     const [showModal, setShowModal] = useState(false);
//     const [isEditingName, setIsEditingName] = useState(false);
//     const [course_name, setCourse_Name] = useState();
//     const [editingExercise, setEditingExercise] = useState(null);
//
//     useEffect(() => {
//         const fetchCourses = async () => {
//             try {
//                 const response = await axios.get(route("courses.get.all"));
//                 setCourses(response.data);
//             } catch (error) {
//                 console.error("Failed to fetch courses:", error);
//             }
//         };
//
//         fetchCourses();
//     }, []);
//
//     const editCourseName = async (courseName, courseId) => {
//         try {
//
//             const response = await axios.put(route("courses.update", {
//                 course_name: course_name,
//                 id: courseId.course_id
//             }));
//             console.log(response.course);
//
//             if (selectedCourse) {
//                 setCourses((prevCourses) => {
//                     return prevCourses.map((course) => {
//                         if (course.id === selectedCourse.id) {
//                             return { ...course, course_name: course_name }; // Bijwerken van de cursusnaam
//                         }
//                         return course;
//                     });
//                 });
//             }
//
//
//             setIsEditingName(false);
//             closeModal()
//         } catch (error) {
//             console.error("Failed to update course: ", error)
//         }
//     }
//
//     const handleUpdateName = (e) => {
//         setIsEditingName(true)
//         const newName = e.target.value
//     }
//
//     const handleDeleteCourse = (course_id) => {
//         try{
//             const response = axios.delete(route("courses.delete", {
//                 "id": course_id
//             }))
//
//             closeModal()
//         } catch (error) {
//             console.error("Failed to delete course")
//         }
//     }
//
//     const handleCardClick = async (courseId) => {
//         try {
//             const response = await axios.get(route("courses.details", { id: courseId }));
//             setSelectedCourse(response.data);
//             setShowModal(true);
//         } catch (error) {
//             console.error("Failed to fetch course details:", error);
//         }
//     };
//
//     const cancelEdit = () => {
//         setIsEditingName(false);
//         setCourse_Name(selectedCourse.course_name);
//     };
//
//     const closeModal = () => {
//         setShowModal(false);
//         setSelectedCourse(null);
//     };
//
//     return (
//         <div className="p-6 bg-gray-100 min-h-screen">
//             <h1 className="text-2xl font-bold mb-6">Cursussen</h1>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {courses.map((course) => (
//                     <div
//                         key={course.id}
//                         className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg"
//                         onClick={() => handleCardClick(course.id)}
//                     >
//                         <h2 className="text-lg font-bold">{course.course_name}</h2>
//                         <p className="text-gray-600">Oefeningen: {course.exercises?.length || 0}</p>
//                     </div>
//                 ))}
//             </div>
//
//             {showModal && selectedCourse && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-3xl">
//                         {isEditingName ? (
//                             <form
//                                 onSubmit={(e) => {
//                                     e.preventDefault();
//                                     const course_id = selectedCourse.id
//                                     setCourse_Name()
//                                     editCourseName({},{course_id}); // Save the new name
//                                 }}
//                                 className="mb-4"
//                             >
//                                 <input
//                                     type="text"
//                                     value={course_name}
//                                     onChange={(e) => setCourse_Name(e.target.value)}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <div className="flex space-x-4 mt-2">
//                                     <button
//                                         type="submit"
//                                         className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700"
//                                     >
//                                         Opslaan
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={cancelEdit}
//                                         className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
//                                     >
//                                         Annuleren
//                                     </button>
//                                 </div>
//                             </form>
//                         ) : (
//                             <h2 className="text-xl font-bold mb-4">{selectedCourse.course_name}</h2>
//                         )}
//
//                         <h3 className="text-lg font-semibold mb-2">Oefeningen</h3>
//                         <div className="space-y-2">
//                             {selectedCourse.exercises.map((exercise) => (
//                                 <div key={exercise.id} className="p-2 bg-gray-100 rounded shadow">
//                                     <p className="font-bold">{exercise.exercise_name}</p>
//                                     <p className="text-sm text-gray-600">Bestand: {exercise.audio_file_path}</p>
//                                     <p className="text-sm text-gray-600">Times Done: {exercise.times_done}</p>
//                                     <p className="text-sm text-gray-600">
//                                         Laatste keer: {exercise.last_time || 'Nog niet gedaan'}
//                                     </p>
//                                     <AudioControl AudioName={exercise.audio_file_path}/>
//
//                                     {exercise.form_answers && exercise.form_answers.length > 0 && (
//                                         <>
//                                             <p className="text-sm font-bold mt-2">Vraag:</p>
//                                             <p className="text-sm text-gray-700">{exercise.form_question}</p>
//                                             <p className="text-sm font-bold mt-2">Antwoorden:</p>
//                                             <ul className="list-disc list-inside">
//                                                 {exercise.form_answers.map((answer, index) => (
//                                                     <li key={index} className="text-sm text-gray-700">
//                                                         {answer || "Geen antwoord ingevuld"}
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         </>
//                                     )}
//
//                                     {/* Toevoegen van de edit knop */}
//                                     <button
//                                         onClick={() => setEditingExercise(exercise)}
//                                         className="mt-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded shadow hover:bg-yellow-600"
//                                     >
//                                         Bewerk oefening
//                                     </button>
//                                 </div>
//                             ))}
//                             {editingExercise && (
//                                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                                     <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-2xl">
//                                         <h2 className="text-lg font-bold mb-4">Bewerk Oefening</h2>
//
//                                         <form
//                                             onSubmit={async (e) => {
//                                                 e.preventDefault();
//
//                                                 const formData = new FormData();
//                                                 formData.append("exercise_id", editingExercise.id);
//                                                 formData.append("exercise_name", editingExercise.exercise_name);
//                                                 formData.append("form_question", editingExercise.form_question);
//                                                 editingExercise.form_answers.forEach((answer) => {
//                                                     formData.append("form_answers[]", answer);
//                                                 });
//
//                                                 if (editingExercise.newFile) {
//                                                     formData.append("audio", editingExercise.newFile);
//                                                 }
//
//                                                 try {
//                                                     await axios.post(route("exercises.update"), formData, {
//                                                         headers: {
//                                                             "Content-Type": "multipart/form-data",
//                                                         },
//                                                     });
//
//                                                     alert("Oefening succesvol bijgewerkt!");
//                                                     setEditingExercise(null);
//                                                     // Vernieuw cursusgegevens (bijvoorbeeld door `handleCardClick` opnieuw aan te roepen)
//                                                     handleCardClick(selectedCourse.id);
//                                                 } catch (error) {
//                                                     console.error("Fout bij bijwerken van oefening:", error);
//                                                     alert("Fout bij bijwerken van oefening.");
//                                                 }
//                                             }}
//                                         >
//                                             {/* Naam */}
//                                             <div className="mb-4">
//                                                 <label className="block text-sm font-medium text-gray-700">Naam</label>
//                                                 <input
//                                                     type="text"
//                                                     value={editingExercise.exercise_name}
//                                                     onChange={(e) =>
//                                                         setEditingExercise({
//                                                             ...editingExercise,
//                                                             exercise_name: e.target.value,
//                                                         })
//                                                     }
//                                                     className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                                                 />
//                                             </div>
//
//                                             {/* Vraag */}
//                                             <div className="mb-4">
//                                                 <label className="block text-sm font-medium text-gray-700">Vraag</label>
//                                                 <input
//                                                     type="text"
//                                                     value={editingExercise.form_question}
//                                                     onChange={(e) =>
//                                                         setEditingExercise({
//                                                             ...editingExercise,
//                                                             form_question: e.target.value,
//                                                         })
//                                                     }
//                                                     className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                                                 />
//                                             </div>
//
//                                             {/* Antwoorden */}
//                                             <div className="mb-4">
//                                                 <label className="block text-sm font-medium text-gray-700">Antwoorden</label>
//                                                 {editingExercise.form_answers.map((answer, index) => (
//                                                     <input
//                                                         key={index}
//                                                         type="text"
//                                                         value={answer}
//                                                         onChange={(e) => {
//                                                             const updatedAnswers = [...editingExercise.form_answers];
//                                                             updatedAnswers[index] = e.target.value;
//                                                             setEditingExercise({
//                                                                 ...editingExercise,
//                                                                 form_answers: updatedAnswers,
//                                                             });
//                                                         }}
//                                                         className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                                                         placeholder={`Antwoord ${index + 1}`}
//                                                     />
//                                                 ))}
//                                             </div>
//
//                                             {/* Audio */}
//                                             <div className="mb-4">
//                                                 <label className="block text-sm font-medium text-gray-700">Nieuwe audio (optioneel)</label>
//                                                 <input
//                                                     type="file"
//                                                     accept="audio/*"
//                                                     onChange={(e) =>
//                                                         setEditingExercise({
//                                                             ...editingExercise,
//                                                             newFile: e.target.files[0],
//                                                         })
//                                                     }
//                                                     className="mt-1 block w-full text-sm text-gray-500"
//                                                 />
//                                             </div>
//
//                                             <div className="flex justify-end space-x-4">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setEditingExercise(null)}
//                                                     className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
//                                                 >
//                                                     Annuleren
//                                                 </button>
//                                                 <button
//                                                     type="submit"
//                                                     className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700"
//                                                 >
//                                                     Opslaan
//                                                 </button>
//                                             </div>
//                                         </form>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//
//                         <div className="button-group flex space-x-4 mt-2">
//                             <button
//                                 onClick={closeModal}
//                                 className="px-4 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700"
//                             >
//                                 Sluiten
//                             </button>
//                             <button
//                                 onClick={handleUpdateName}
//                                 className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700"
//                             >
//                                 Verander de naam
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     handleDeleteCourse(selectedCourse.id)
//                                 }}
//                                 className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
//                             >
//                                 Verwijderen
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//
//         </div>
//     );
// }

