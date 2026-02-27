import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import ProfileOverview from "@/Components/ProfileOverview.jsx";
import CourseList from "@/Components/CourseList.jsx";
import axios from "axios";

export default function DashboardViewer({
                                            exerciseCountLastWeek,
                                            showSurvey,
                                        }) {
    const [question, setQuestion] = useState(""); // Vraag
    const [answers, setAnswers] = useState([]); // Antwoordopties
    const [selectedAnswer, setSelectedAnswer] = useState(null); // Gekozen antwoord
    const [hasAnswered, setHasAnswered] = useState(false); // Beheert of de gebruiker een antwoord heeft ingediend

    // Haal de vraag en antwoorden op bij het laden van de component
    useEffect(() => {
        if (showSurvey) {
            const fetchSurvey = async () => {
                try {
                    const response = await axios.get(route("researchsettings.getallsettings"));
                    const questionSetting = response.data.find((setting) => setQuestion(setting.question));
                    const answersSetting = response.data.find((setting) => setAnswers(JSON.parse(setting.answers)));

                    if (questionSetting) {
                        setQuestion(questionSetting.value);
                    }
                    if (answersSetting) {
                        setAnswers(JSON.parse(answersSetting.value));
                    }
                } catch (error) {
                    console.error("Fout bij het ophalen van de vragenlijst:", error);
                }
            };

            fetchSurvey();
        }
    }, [showSurvey]);

    const handleAnswerChange = (e) => {
        setSelectedAnswer(e.target.value);
    };

    const handleSubmit = () => {
        if (selectedAnswer) {
            alert(`Bedankt voor je antwoord: ${selectedAnswer}`);
            setHasAnswered(true); // Markeer als beantwoord




        } else {
            alert("Selecteer een antwoord voordat je verdergaat.");
        }
    };

    if (showSurvey && !hasAnswered) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-2xl font-heading font-bold text-primary leading-tight">
                        Dashboard Viewer
                    </h2>
                }
            >
                <Head title="Vragenlijst" />
                <section className="py-12 bg-lightGray">
                    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h1 className="text-2xl font-bold mb-4">Vragenlijst</h1>
                            <p className="text-lg font-semibold mb-4">{question}</p>
                            <form>
                                {answers.map((answer, index) => (
                                    <div key={index} className="mb-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="survey"
                                                value={answer}
                                                onChange={handleAnswerChange}
                                                className="mr-2"
                                            />
                                            {answer}
                                        </label>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none"
                                >
                                    Bevestigen
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-heading font-bold text-primary leading-tight">
                    Dashboard Viewer
                </h2>
            }
        >
            <Head title="Dashboard Viewer" />
            {/* Profieloverzicht */}
            <section className="py-12 bg-lightGray">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div>
                        <ProfileOverview exerciseCountLastWeek={exerciseCountLastWeek} />
                    </div>
                </div>
            </section>

            {/* Lijst van cursussen */}
            <section className="py-12">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-6">
                        <CourseList />
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
