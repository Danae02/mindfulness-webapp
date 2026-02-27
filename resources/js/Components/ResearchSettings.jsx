import React, { useEffect, useState } from "react";
import axios from "axios";
import ToolTip from "@/Components/ToolTip.jsx";

export default function ResearchSettings() {
    const [mode, setMode] = useState("per_session"); // Standaard op 'per_session'
    const [question, setQuestion] = useState(""); // Vraag
    const [answers, setAnswers] = useState(Array(5).fill("")); // 5 lege antwoorden
    const [isEditing, setIsEditing] = useState(false); // Voor de bewerkingsmodus

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(route("researchsettings.getallsettings"));

                const modeSetting = response.data.find((setting) => setting.key_name === "mode");
                if (modeSetting) {
                    setMode(modeSetting.value);
                }
                const questionSetting = response.data.find((setting) => setQuestion(setting.question))
                const answersSetting = response.data.find((setting) => setAnswers(JSON.parse(setting.answers)));


            } catch (err) {
                console.error("Fout bij het ophalen van de instellingen:", err);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        const payload = {
            key_name: "mode",
            value: mode,
            question: mode === "per_session" ? question : null,
            answers: mode === "per_session" ? answers : [],
        };

        try {
            const response = await axios.post(route("researchsettings.update"), payload);
            console.log("Instelling succesvol geüpdatet:", response.data);
            alert("Instelling succesvol opgeslagen!");
            setIsEditing(false); // Verlaat bewerkingsmodus na opslaan
        } catch (error) {
            console.error("Fout bij het opslaan van de instelling:", error.response?.data || error.message);
            alert("Er ging iets mis bij het opslaan.");
        }
    };

    const handleAnswerChange = (index, value) => {
        setAnswers((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-card">
            <h1 className="text-3xl font-heading text-darkGray mb-4">Onderzoeks Instellingen</h1>
            <p className="text-lg text-darkGray mb-6">
                Huidige instelling: <strong>{mode === "per_session" ? "Per Sessie" : "Per Oefening"}</strong>
            </p>

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
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                                <p>{question || "Geen vraag ingesteld"}</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Antwoorden (1-5)</label>
                                {answers.length > 0 ? (
                                    answers.map((answer, index) => (
                                        <p key={index}>Antwoord {index + 1}: {answer}</p>
                                    ))
                                ) : (
                                    <p>Geen antwoorden ingesteld</p>
                                )}

                            </div>
                            <button
                                onClick={() => setIsEditing(true)} // Zet de bewerkingsmodus aan
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Bewerken
                            </button>
                        </div>
                    ) : (
                        // Bewerkingselementen tonen
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
                            <button
                                onClick={handleSave}
                                className="w-full px-4 py-2 bg-green-500 text-white rounded"
                            >
                                Opslaan
                            </button>
                            <button
                                onClick={() => setIsEditing(false)} // Zet de bewerkingsmodus uit
                                className="w-full mt-2 px-4 py-2 bg-gray-500 text-white rounded"
                            >
                                Annuleren
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
