import {useEffect, useState} from "react";
import axios from "axios";

export default function AudioFileUploader({
                                              chapterNumber,
                                              courseId,
                                              chapter,
                                              onChapterUpdate,
                                          }) {
    const [uploading, setUploading] = useState(false);
    const [question, setQuestion] = useState(""); // Vraag
    const [answers, setAnswers] = useState(["", "", "", "", ""]); // Antwoorden
    const [mode, setMode] = useState();

    useEffect(() => {
        const fetchMode = async () => {
            try {
                const response = await axios.get(route("researchsettings.getmode")) ;
                setMode(response.data.mode); // Stel de modus in
            } catch (error) {
                console.error("Fout bij ophalen van modus:", error);
            }
        };

        fetchMode();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        onChapterUpdate({ ...chapter, file });
    };

    const handleNameChange = (e) => {
        const chapterName = e.target.value;
        onChapterUpdate({ ...chapter, chapterName });
    };

    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    const handleAnswerChange = (index, value) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index] = value;
        setAnswers(updatedAnswers);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!chapter.file || !chapter.chapterName) {
            alert(`Voer alle velden in voor hoofdstuk ${chapterNumber}.`);
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("audio", chapter.file);
            formData.append("course_id", courseId);
            formData.append("exercise_name", chapter.chapterName);

            // Voeg alleen de vragenlijst toe als de modus niet 'per_session' is
            if (mode !== "per_session") { // verandering if (chapter.mode !== "per_session") {
                formData.append("form_question", question);
                answers.forEach((answer) => {
                    formData.append(`form_answers[]`, answer);
                });
            }

            await axios.post(route("exercises.create"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert(`Hoofdstuk ${chapterNumber} succesvol geüpload!`);
        } catch (error) {
            console.error("Upload failed:", error);
            console.error("Validation errors:", error.response?.data); // Add this
            alert(`Fout bij uploaden van hoofdstuk ${chapterNumber}.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                Oefening {chapterNumber}
            </h3>
            <div className="mb-4">
                <label htmlFor={`chapter-name-${chapterNumber}`} className="block text-sm font-medium text-gray-700">
                    Naam van de oefening
                </label>
                <input
                    type="text"
                    id={`chapter-name-${chapterNumber}`}
                    value={chapter.chapterName}
                    onChange={handleNameChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bijvoorbeeld: Inleiding tot mindfulness"
                />
            </div>
            <div className="mb-4">
                <label htmlFor={`audio-chapter-${chapterNumber}`} className="block text-sm font-medium text-gray-700">
                    Upload audio
                </label>
                <input
                    type="file"
                    id={`audio-chapter-${chapterNumber}`}
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500"
                />
            </div>

            {/* Alleen renderen als de modus niet 'per_session' is */}
            {mode !== "per_session" && (
                <>
                    <div className="mb-4">
                        <label htmlFor={`form-question-${chapterNumber}`} className="block text-sm font-medium text-gray-700">
                            Vraag
                        </label>
                        <input
                            type="text"
                            id={`form-question-${chapterNumber}`}
                            value={question}
                            onChange={handleQuestionChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Bijvoorbeeld: Hoe moeilijk vond je deze oefening?"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Antwoorden (1-5)</label>
                        {answers.map((answer, index) => (
                            <input
                                key={index}
                                type="text"
                                value={answer}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`Antwoord ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
            <button
                type="submit"
                disabled={uploading}
                className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none"
            >
                {uploading ? "Uploading..." : `Upload Hoofdstuk ${chapterNumber}`}
            </button>
        </form>
    );
}
