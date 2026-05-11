import { useState } from "react";
import AudioFileUploader from "./AudioFileUploader.jsx";
import axios from "axios";

function StepIndicator({ currentStep }) {
    return (
        <div className="flex items-center justify-center mb-8">
            {/* Stap 1 */}
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                        backgroundColor: currentStep >= 1 ? "#6C4092" : "#E5E7EB",
                        color: currentStep >= 1 ? "#fff" : "#4B5563",
                    }}
                >
                    {currentStep > 1 ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : "1"}
                </div>
                <span
                    className="text-sm font-semibold"
                    style={{ color: currentStep >= 1 ? "#6C4092" : "#4B5563" }}
                >
                    Cursus informatie
                </span>
            </div>

            {/* Lijn */}
            <div
                className="h-px w-12 mx-3 transition-all"
                style={{ backgroundColor: currentStep > 1 ? "#6C4092" : "#D1D5DB", borderTop: "2px dashed" }}
            />

            {/* Stap 2 */}
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                        backgroundColor: currentStep >= 2 ? "#6C4092" : "#E5E7EB",
                        color: currentStep >= 2 ? "#fff" : "#4B5563",
                    }}
                >
                    2
                </div>
                <span
                    className="text-sm font-semibold"
                    style={{ color: currentStep >= 2 ? "#6C4092" : "#4B5563" }}
                >
                    Oefening uploaden
                </span>
            </div>
        </div>
    );
}

export default function CourseUploader({ onCancel }) {
    const [step, setStep]             = useState(1);
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [numExercises, setNumExercises] = useState(1);
    const [chapters, setChapters]         = useState([]);
    const [courseId, setCourseId]         = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors]             = useState({});
    const [uploadedIndexes, setUploadedIndexes] = useState(new Set());

    const handleExerciseUploaded = (index) => {
        setUploadedIndexes((prev) => new Set([...prev, index]));
    };

    const hasAtLeastOneUpload = uploadedIndexes.size > 0;

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!courseName.trim()) {
            newErrors.courseName = "Vul een cursusnaam in.";
        }
        if (numExercises < 1) {
            newErrors.numExercises = "Minimaal 1 oefening.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(route("courses.create"), {
                course_name: courseName,
                description: description || null,
            });

            setCourseId(response.data.course_id);
            setChapters(
                Array.from({ length: numExercises }, () => ({ chapterName: "", file: null }))
            );
            setErrors({});
            setStep(2);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors({ courseName: error.response.data.message || "De cursusnaam bestaat al." });
            } else {
                setErrors({ general: "Er is een fout opgetreden. Probeer het opnieuw." });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateChapter = (index, updatedChapter) => {
        const updated = [...chapters];
        updated[index] = updatedChapter;
        setChapters(updated);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <StepIndicator currentStep={step} />

            {/* Stap 1 */}
            {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Nieuwe cursus aanmaken</h2>
                    <p className="text-sm text-gray-600 mb-6">Stap 1 van de 2</p>

                    <form onSubmit={handleStep1Submit} className="space-y-5">
                        {/* Cursusnaam */}
                        <div>
                            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                                Naam van de cursus <span className="text-red-500" aria-hidden="true">*</span>
                                <span className="sr-only">(verplicht)</span>
                            </label>
                            <input
                                type="text"
                                id="courseName"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="Bijvoorbeeld: Mindfulness Basics"
                                required
                                aria-required="true"
                                aria-describedby={errors.courseName ? "courseName-error" : undefined}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors ${
                                    errors.courseName ? "border-red-400 bg-red-50" : "border-gray-300"
                                }`}
                            />
                            {errors.courseName && (
                                <p id="courseName-error" className="mt-1 text-xs text-red-600" role="alert">
                                    {errors.courseName}
                                </p>
                            )}
                        </div>

                        {/* Omschrijving */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Omschrijving
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Korte beschrijving zichtbaar voor cliënten..."
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors resize-none"
                            />
                        </div>

                        {/* Aantal oefeningen */}
                        <div>
                            <label htmlFor="numExercises" className="block text-sm font-medium text-gray-700 mb-1">
                                Aantal oefeningen <span className="text-red-500" aria-hidden="true">*</span>
                                <span className="sr-only">(verplicht)</span>
                            </label>
                            <input
                                type="number"
                                id="numExercises"
                                value={numExercises}
                                min={1}
                                max={50}
                                required
                                aria-required="true"
                                aria-describedby={errors.numExercises ? "numExercises-error" : undefined}
                                onChange={(e) => setNumExercises(Number(e.target.value))}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors ${
                                    errors.numExercises ? "border-red-400 bg-red-50" : "border-gray-300"
                                }`}
                            />
                            {errors.numExercises && (
                                <p id="numExercises-error" className="mt-1 text-xs text-red-600" role="alert">
                                    {errors.numExercises}
                                </p>
                            )}
                        </div>

                        {errors.general && (
                            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg" role="alert">
                                {errors.general}
                            </p>
                        )}

                        {/* Knoppen */}
                        <div className="flex justify-between pt-2">
                            {onCancel ? (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                >
                                    Annuleren
                                </button>
                            ) : <div />}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-60"
                                style={{ backgroundColor: "#6C4092" }}
                            >
                                {isSubmitting ? "Bezig..." : (
                                    <>
                                        Volgende stap
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stap 2 */}
            {step === 2 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Oefeningen uploaden</h2>
                    <p className="text-sm text-gray-600 mb-6">Stap 2 van de 2</p>

                    <div className="space-y-4">
                        {chapters.map((chapter, index) => (
                            <AudioFileUploader
                                key={index}
                                chapterNumber={index + 1}
                                courseId={courseId}
                                chapter={chapter}
                                onChapterUpdate={(updatedChapter) => updateChapter(index, updatedChapter)}
                                onUploaded={() => handleExerciseUploaded(index)}
                            />
                        ))}
                    </div>

                    {/* Knoppen */}
                    <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Vorige stap
                        </button>

                        <div className="flex flex-col items-end gap-1">
                            {!hasAtLeastOneUpload && (
                                <p className="text-xs text-amber-700" role="alert">
                                    Upload minimaal één oefening om op te slaan.
                                </p>
                            )}
                            <button
                                type="button"
                                disabled={!hasAtLeastOneUpload}
                                onClick={() => {
                                    setStep(1);
                                    setCourseName("");
                                    setDescription("");
                                    setNumExercises(1);
                                    setChapters([]);
                                    setCourseId(null);
                                    setErrors({});
                                    setUploadedIndexes(new Set());
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#6C4092" }}
                                aria-disabled={!hasAtLeastOneUpload}
                            >
                                Cursus opslaan
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
