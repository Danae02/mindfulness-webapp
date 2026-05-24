import { useEffect, useRef, useState } from "react";
import axios from "axios";


function ExerciseEditForm({ exercise, onSave, onCancel }) {
    const [name, setName]         = useState(exercise.exercise_name);
    const [question, setQuestion] = useState(exercise.form_question || "");
    const [answers, setAnswers]   = useState(
        exercise.form_answers?.length ? exercise.form_answers : ["", "", "", "", ""]
    );
    const [newFile, setNewFile] = useState(null);
    const [saving, setSaving]   = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ ...exercise, exercise_name: name, form_question: question, form_answers: answers, newFile });
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 pt-3 border-t border-gray-300">
            <div>
                <label htmlFor={`exercise-name-${exercise.id}`} className="block text-xs font-semibold text-gray-700 mb-1">
                    Naam oefening
                </label>
                <input
                    id={`exercise-name-${exercise.id}`}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1"
                    aria-required="true"
                />
            </div>

            <div>
                <label htmlFor={`audio-file-${exercise.id}`} className="block text-xs font-semibold text-gray-700 mb-1">
                    Nieuw audiobestand (optioneel)
                </label>
                <div className="relative">
                    <input
                        id={`audio-file-${exercise.id}`}
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setNewFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        aria-label="Kies een nieuw audiobestand"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#6C4092] border-2 border-[#6C4092] rounded-lg hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1"
                        aria-hidden="true"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {newFile ? newFile.name : "Bestand kiezen"}
                    </button>
                </div>
                {newFile && (
                    <p className="text-xs text-green-600 mt-1">
                        Geselecteerd: {newFile.name}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1"
                >
                    Annuleren
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1 disabled:opacity-60"
                    style={{ backgroundColor: "#6C4092" }}
                >
                    {saving ? "Opslaan..." : "Opslaan"}
                </button>
            </div>
        </form>
    );
}


function CourseEditForm({ course, onSave, onCancel }) {
    const [name, setName]               = useState(course.course_name);
    const [description, setDescription] = useState(course.description || "");
    const [saving, setSaving]           = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ course_name: name, description });
        setSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 pt-4 border-t border-gray-300">
            <div>
                <label htmlFor="course-name-edit" className="block text-sm font-semibold text-gray-700 mb-1">
                    Naam van de cursus
                </label>
                <input
                    id="course-name-edit"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1"
                    aria-required="true"
                />
            </div>
            <div>
                <label htmlFor="course-description-edit" className="block text-sm font-semibold text-gray-700 mb-1">
                    Omschrijving
                </label>
                <textarea
                    id="course-description-edit"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Korte beschrijving zichtbaar voor cliënten..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1 resize-none"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1"
                >
                    Annuleren
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1 disabled:opacity-60"
                    style={{ backgroundColor: "#6C4092" }}
                >
                    {saving ? "Opslaan..." : "Wijzigingen opslaan"}
                </button>
            </div>
        </form>
    );
}


function CourseModal({ course, onClose, onCourseUpdated, onCourseDeleted, onExerciseUpdated, onExerciseDeleted }) {
    const modalRef      = useRef(null);
    const closeRef      = useRef(null);
    const [editingExerciseId, setEditingExerciseId] = useState(null);
    const [editingCourse, setEditingCourse]         = useState(false);
    const [confirmDelete, setConfirmDelete]         = useState(false);
    const [localCourse, setLocalCourse]             = useState(course);

    useEffect(() => {
        const prev = document.activeElement;
        closeRef.current?.focus();

        const focusableSelectors =
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const handleKeyDown = (e) => {
            if (e.key === "Escape") { onClose(); return; }
            if (e.key !== "Tab") return;
            const focusable = Array.from(modalRef.current?.querySelectorAll(focusableSelectors) || []);
            const first = focusable[0];
            const last  = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => { document.removeEventListener("keydown", handleKeyDown); prev?.focus(); };
    }, [onClose]);

    const handleSaveCourse = async ({ course_name, description }) => {
        try {
            await axios.put(route("courses.update", { id: localCourse.id }), { course_name, description });
            const updated = { ...localCourse, course_name, description };
            setLocalCourse(updated);
            onCourseUpdated(updated);
            setEditingCourse(false);
        } catch (error) {
            console.error("Fout bij bijwerken cursus:", error);
            alert("Fout bij opslaan van cursus.");
        }
    };

    const handleDeleteCourse = async () => {
        try {
            await axios.delete(route("courses.delete", { id: localCourse.id }));
            onCourseDeleted(localCourse.id);
            onClose();
        } catch (error) {
            console.error("Fout bij verwijderen cursus:", error);
            alert("Fout bij verwijderen van cursus.");
        }
    };

    const handleSaveExercise = async (updatedExercise) => {
        try {
            const formData = new FormData();
            formData.append("exercise_name", updatedExercise.exercise_name);
            formData.append("form_question", updatedExercise.form_question || "");
            const answers = updatedExercise.form_answers || ["", "", "", "", ""];
            answers.forEach((a, i) => formData.append(`form_answers[${i}]`, a || ""));
            if (updatedExercise.newFile) formData.append("audio", updatedExercise.newFile);
            formData.append("_method", "PUT");

            const response = await axios.post(
                route("exercises.update", { id: updatedExercise.id }),
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const saved = response.data.exercise;
            const updated = {
                ...localCourse,
                exercises: localCourse.exercises.map((ex) =>
                    ex.id === saved.id ? saved : ex
                ),
            };
            setLocalCourse(updated);
            onExerciseUpdated(saved);
            setEditingExerciseId(null);
        } catch (error) {
            console.error("Fout bij bijwerken oefening:", error);
            alert("Fout bij opslaan van oefening.");
        }
    };

    const handleDeleteExercise = async (exerciseId) => {
        if (!confirm("Weet je zeker dat je deze oefening wilt verwijderen?")) return;
        try {
            await axios.delete(route("exercises.delete", { id: exerciseId }));
            const updated = {
                ...localCourse,
                exercises: localCourse.exercises.filter((ex) => ex.id !== exerciseId),
            };
            setLocalCourse(updated);
            onExerciseDeleted(exerciseId);
        } catch (error) {
            console.error("Fout bij verwijderen oefening:", error);
            alert("Fout bij verwijderen van oefening.");
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-course-title"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-6 pb-0">
                    <h2 id="modal-course-title" className="text-xl font-bold text-gray-900 pr-4">
                        {localCourse.course_name}
                    </h2>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        className="w-11 h-11 flex-shrink-0 flex items-center justify-center border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1"
                        aria-label="Sluit venster"
                    >
                        <span aria-hidden="true">✕</span>
                        <span className="sr-only">Sluit dit venster</span>
                    </button>
                </div>

                <div className="px-6 pb-6">
                    {!editingCourse && (
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Omschrijving</p>
                            <div
                                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 leading-relaxed"
                                style={{ backgroundColor: "#F0E8FF", border: "1px solid #D4C5F0" }}
                            >
                                {localCourse.description || (
                                    <span className="italic text-gray-600">Geen omschrijving</span>
                                )}
                            </div>
                        </div>
                    )}

                    {editingCourse && (
                        <CourseEditForm
                            course={localCourse}
                            onSave={handleSaveCourse}
                            onCancel={() => setEditingCourse(false)}
                        />
                    )}

                    {!editingCourse && (
                        <>
                            <h3 className="text-base font-semibold text-gray-600 mt-6 mb-3">
                                Oefeningen in deze cursus
                            </h3>

                            {localCourse.exercises?.length === 0 && (
                                <p className="text-sm text-gray-600 italic">Geen oefeningen in deze cursus.</p>
                            )}

                            <div className="space-y-3" role="list">
                                {localCourse.exercises?.map((exercise) => (
                                    <div
                                        key={exercise.id}
                                        role="listitem"
                                        className="rounded-xl border border-gray-400 p-4"
                                    >
                                        <p className="font-bold text-gray-900 mb-1">{exercise.exercise_name}</p>

                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                                            </svg>
                                            <span className="truncate max-w-xs">
                                                Bestand: {exercise.audio_file_path || "–"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Keren gedaan: {exercise.times_done ?? 0}</span>
                                        </div>

                                        {editingExerciseId !== exercise.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDeleteExercise(exercise.id)}
                                                    aria-label={`Verwijder oefening ${exercise.exercise_name}`}
                                                    className="px-3 py-2 text-sm font-semibold rounded-lg border-2 border-red-600 text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-1"
                                                >
                                                    Verwijderen
                                                </button>
                                                <button
                                                    onClick={() => setEditingExerciseId(exercise.id)}
                                                    aria-label={`Bewerk oefening ${exercise.exercise_name}`}
                                                    className="px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1"
                                                    style={{ borderColor: "#6C4092", color: "#6C4092" }}
                                                >
                                                    Bewerken
                                                </button>
                                            </div>
                                        ) : (
                                            <ExerciseEditForm
                                                exercise={exercise}
                                                onSave={handleSaveExercise}
                                                onCancel={() => setEditingExerciseId(null)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {!editingCourse && !localCourse.is_intro && (
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-300">
                            {!confirmDelete ? (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="flex-1 py-3 text-sm font-semibold text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
                                    style={{ backgroundColor: "#DC2626" }}
                                    aria-label={`Verwijder cursus ${localCourse.course_name}`}
                                >
                                    Cursus verwijderen
                                </button>
                            ) : (
                                <div className="flex-1 flex items-center gap-2 bg-red-50 border border-red-300 rounded-xl px-3 py-2">
                                    <p className="text-xs text-red-800 font-medium flex-1">Zeker weten?</p>
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="px-3 py-2 text-xs font-medium text-gray-700 border border-gray-400 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-1"
                                    >
                                        Nee
                                    </button>
                                    <button
                                        onClick={handleDeleteCourse}
                                        className="px-3 py-2 text-xs font-semibold text-white bg-red-700 rounded-lg hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-1"
                                    >
                                        Ja, verwijderen
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => setEditingCourse(true)}
                                className="flex-1 py-3 text-sm font-semibold text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-2"
                                style={{ backgroundColor: "#6C4092" }}
                                aria-label={`Bewerk cursus ${localCourse.course_name}`}
                            >
                                Cursus bewerken
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


// CourseEditor
export default function CourseEditor({ onAddCourse }) {
    const [courses,        setCourses]        = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading,        setLoading]        = useState(true);

    useEffect(() => {
        axios.get(route("courses.get.all"))
            .then((res) => setCourses(res.data))
            .catch((err) => console.error("Failed to fetch courses:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleCourseClick = async (courseId) => {
        try {
            const response = await axios.get(route("courses.details", { id: courseId }));
            setSelectedCourse(response.data);
        } catch (error) {
            console.error("Failed to fetch course details:", error);
        }
    };

    const handleCourseUpdated = (updatedCourse) => {
        setCourses((prev) =>
            prev.map((c) => (c.id === updatedCourse.id ? { ...c, ...updatedCourse } : c))
        );
        setSelectedCourse((prev) => prev ? { ...prev, ...updatedCourse } : prev);
    };

    const handleCourseDeleted = (courseId) => {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setSelectedCourse(null);
    };

    const handleExerciseUpdated = (savedExercise) => {
        setCourses((prev) =>
            prev.map((c) => ({
                ...c,
                exercises: c.exercises?.map((ex) =>
                    ex.id === savedExercise.id ? savedExercise : ex
                ),
            }))
        );
    };

    const handleExerciseDeleted = (exerciseId) => {
        setCourses((prev) =>
            prev.map((c) => ({
                ...c,
                exercises: c.exercises?.filter((ex) => ex.id !== exerciseId),
            }))
        );
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-8 text-gray-600 text-sm" aria-live="polite">
                <svg className="animate-spin h-4 w-4 text-purple-700" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cursussen laden…
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-4" style={{ border: "1px solid #5F5F5F", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
            {courses.length === 0 && (
                <p className="text-sm text-gray-600 italic py-4">Nog geen cursussen aangemaakt.</p>
            )}

            <div className="flex flex-col gap-3" role="list" aria-label="Overzicht van alle cursussen">
                {courses.map((course) => {
                    const exerciseCount = course.exercises?.length ?? 0;
                    const isIntro = course.is_intro || course.id === 'intro';

                    if (isIntro) {
                        return (
                            <div
                                key={course.id}
                                role="listitem"
                                aria-label={`${course.course_name} — standaard introductie, niet bewerkbaar`}
                                className="w-full rounded-xl border-2 px-5 py-4 cursor-default opacity-75"
                                style={{ backgroundColor: '#F5F3F8', borderColor: '#9B8AB0' }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-gray-800 text-base">{course.course_name}</p>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-600 bg-gray-200 border border-gray-400">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                        </svg>
                                        Niet bewerkbaar
                                    </span>
                                </div>

                                {course.description && (
                                    <p className="text-sm text-gray-600 mb-2 leading-snug">
                                        {course.description}
                                    </p>
                                )}

                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                     style={{ backgroundColor: "#F0E8FF", color: "#6C4092" }}>
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                    </svg>
                                    {exerciseCount} oefening{exerciseCount !== 1 ? "en" : ""}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={course.id}
                            role="listitem"
                            onClick={() => handleCourseClick(course.id)}
                            aria-label={`Open cursus: ${course.course_name}, ${exerciseCount} oefening${exerciseCount !== 1 ? "en" : ""}`}
                            className="w-full text-left bg-white rounded-xl border-2 border-[#6C4092] px-5 py-4 hover:bg-purple-50 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-2"
                        >
                            <p className="font-bold text-gray-900 text-base mb-1">{course.course_name}</p>

                            {course.description && (
                                <p className="text-sm text-gray-600 mb-2 leading-snug">
                                    {course.description}
                                </p>
                            )}

                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                 style={{ backgroundColor: "#F0E8FF", color: "#6C4092" }}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                </svg>
                                {exerciseCount} oefening{exerciseCount !== 1 ? "en" : ""}
                            </div>
                        </button>
                    );
                })}
            </div>

            {selectedCourse && (
                <CourseModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onCourseUpdated={handleCourseUpdated}
                    onCourseDeleted={handleCourseDeleted}
                    onExerciseUpdated={handleExerciseUpdated}
                    onExerciseDeleted={handleExerciseDeleted}
                />
            )}
        </div>
    );
}
