import React, { useState, useEffect } from "react";
import ToolTip from "@/Components/ToolTip.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

export default function ResearchSettings({
                                             settings = null,
                                             loading = false,
                                             error = null,
                                             onSave = async () => {},
                                         }) {
    const [mode, setMode] = useState("per_session");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState(Array(5).fill(""));
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Initialize from props when settings loads
    useEffect(() => {
        if (settings && Array.isArray(settings)) {
            const modeSetting = settings.find((setting) => setting.key_name === "mode");
            if (modeSetting) {
                setMode(modeSetting.value);
            }

            const questionSetting = settings.find((setting) => setting.question);
            if (questionSetting) {
                setQuestion(questionSetting.question);
            }

            const answersSetting = settings.find((setting) => setting.answers);
            if (answersSetting) {
                try {
                    const parsedAnswers = typeof answersSetting.answers === 'string'
                        ? JSON.parse(answersSetting.answers)
                        : answersSetting.answers;
                    setAnswers(Array.isArray(parsedAnswers) ? parsedAnswers : Array(5).fill(""));
                } catch (e) {
                    setAnswers(Array(5).fill(""));
                }
            }
        }
    }, [settings]);

    const handleSave = async () => {
        setSaveError(null);
        setIsSaving(true);

        const payload = {
            key_name: "mode",
            value: mode,
            question: mode === "per_session" ? question : null,
            answers: mode === "per_session" ? answers : [],
        };

        try {
            await onSave(payload);
            setIsEditing(false);
        } catch (err) {
            console.error("Fout bij het opslaan van de instelling:", err);
            setSaveError("Er ging iets mis bij het opslaan.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnswerChange = (index, value) => {
        setAnswers((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    if (loading) return <LoadingIndicator message="Instellingen laden..." />;
    if (error) return <div className="text-red-600 p-4">{error}</div>;

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-card">
            <h1 className="text-3xl font-heading text-darkGray mb-4">Onderzoeks Instellingen</h1>
            <p className="text-lg text-darkGray mb-6">
                Huidge instelling: <strong>{mode === "per_session" ? "Per Sessie" : "Per Oefening"}</strong>
            </p>

            {saveError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {saveError}
                </div>
            )}

            {/* Mode Selectie */}
            <div className="mb-6">
                <label className="flex items-center">
                    <span className="mr-2">Mode</span>
                    <ToolTip>
                        Kies de modus waarin de functie werkt.
                        <strong> Per sessie</strong> houdt gegevens bij per sessie,
                        terwijl <strong>per oefening</strong> de gegevens voor elke oefening opslaat.
                    </ToolTip>
                </label>
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="per_session">Per Sessie</option>
                    <option value="per_exercise">Per Oefening</option>
                </select>
            </div>

            {/* Vragen en antwoorden alleen tonen als de modus 'per_session' is */}
            {mode === "per_session" && (
                <div>
                    {!isEditing ? (
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Vraag</label>
                                <p className="mt-1 text-gray-900">{question || "Geen vraag ingesteld"}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Antwoorden (1-5)</label>
                                {answers && answers.length > 0 ? (
                                    <div className="mt-1 space-y-1">
                                        {answers.map((answer, index) => (
                                            <p key={index} className="text-gray-900">
                                                {index + 1}. {answer || "(leeg)"}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-gray-500">Geen antwoorden ingesteld</p>
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Bewerken
                            </button>
                        </div>
                    ) : (
                        // Bewerkingselementen
                        <div>
                            <div className="mb-4">
                                <label htmlFor="form-question" className="block text-sm font-medium text-gray-700">
                                    Vraag
                                </label>
                                <input
                                    type="text"
                                    id="form-question"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Bijvoorbeeld: Hoe moeilijk vond je deze oefening?"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Antwoorden (1-5)
                                </label>
                                <div className="space-y-2">
                                    {answers.map((answer, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={answer}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={`Antwoord ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSaving ? "Bezig..." : "Opslaan"}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setSaveError(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                    Annuleren
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {mode === "per_exercise" && !isEditing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        In de modus "Per Oefening" worden vragen per oefening beheerd.
                    </p>
                </div>
            )}
        </div>
    );
}
