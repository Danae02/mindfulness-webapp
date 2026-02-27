import { useState } from "react";
import AudioFileUploader from "./AudioFileUploader.jsx";
import axios from "axios";

export default function CourseUploader() {
    const [courseName, setCourseName] = useState("");
    const [levels, setLevels] = useState(0);
    const [chapters, setChapters] = useState([]);
    const [showChapters, setShowChapters] = useState(false);
    const [courseId, setCourseId] = useState(null);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!courseName || levels <= 0) {
            alert("Vul de cursusnaam in en een geldig aantal hoofdstukken.");
            return;
        }

        try {
            const chapterResponse = await axios.post(route('courses.create'), {
                course_name: courseName,
            });

            setCourseId(chapterResponse.data.course_id);

            setChapters(
                Array.from({ length: levels }, () => ({ chapterName: "", file: null }))
            );
            setShowChapters(true);
        } catch (error) {
            // Controleer of de fout een reactie van de server bevat
            if (error.response && error.response.status === 422) {
                alert(error.response.data.message || "De cursusnaam bestaat al.");
            } else {
                alert("Er is een fout opgetreden. Probeer het opnieuw.");
            }
        }
    };

    const updateChapter = (index, updatedChapter) => {
        const updatedChapters = [...chapters];
        updatedChapters[index] = updatedChapter;
        setChapters(updatedChapters);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h1 className="text-2xl font-bold text-bartimeusGreen mb-6">
                    Upload Mindfulness Cursus
                </h1>
                {!showChapters ? (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="courseName"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Naam van de cursus
                            </label>
                            <input
                                type="text"
                                id="courseName"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-bartimeusGreen focus:border-bartimeusGreen"
                                placeholder="Bijvoorbeeld: Mindfulness Basics"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="levels"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Aantal hoofdstukken/levels
                            </label>
                            <input
                                type="number"
                                id="levels"
                                value={levels}
                                onChange={(e) => setLevels(Number(e.target.value))}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-bartimeusGreen focus:border-bartimeusGreen"
                                placeholder="Bijvoorbeeld: 5"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-bartimeusGreen text-white font-semibold rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bartimeusGreen"
                        >
                            Ga verder
                        </button>
                    </form>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Oefeningen uploaden
                        </h2>
                        {chapters.map((chapter, index) => (
                            <AudioFileUploader
                                key={index}
                                chapterNumber={index + 1}
                                // courseName={courseName}
                                courseId={courseId}
                                chapter={chapter}
                                onChapterUpdate={(updatedChapter) =>
                                    updateChapter(index, updatedChapter)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
