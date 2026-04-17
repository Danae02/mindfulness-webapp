import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import AudioControl from "@/Components/AudioControl.jsx";
import axios from 'axios';

export default function ExercisePage({ exercise, researchMode, researchQuestion, researchAnswers, alreadyCompletedToday }) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [showStartQuestion, setShowStartQuestion] = useState(true);
    const [showEndQuestion, setShowEndQuestion] = useState(false);
    const [hasAnsweredEnd, setHasAnsweredEnd] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState({ value: null, index: null });
    const [skipQuestions, setSkipQuestions] = useState(false);

    const user = usePage().props.auth.user;

    const getQuestion = () => {
        if (researchMode === 'per_exercise' && researchQuestion) {
            return researchQuestion;
        }
        return exercise.form_question;
    };

    const getAnswers = () => {
        if (researchMode === 'per_exercise' && researchAnswers) {
            if (typeof researchAnswers === 'string') {
                return JSON.parse(researchAnswers);
            }
            return researchAnswers;
        }
        if (typeof exercise.form_answers === 'string') {
            return JSON.parse(exercise.form_answers);
        }
        return exercise.form_answers;
    };

    const currentQuestion = getQuestion();
    const currentAnswers  = getAnswers();
    const hasQuestions    = currentQuestion && currentAnswers && currentAnswers.length > 0;

    // Het aantal antwoordopties dat nu actief is
    const feelingScale = currentAnswers?.length ?? 5;

    useEffect(() => {
        if (alreadyCompletedToday) {
            setSkipQuestions(true);
            setShowStartQuestion(false);
            setShowEndQuestion(false);
            setHasAnsweredEnd(true);
            setSelectedAnswer({ value: null, index: null });
        } else {
            setSkipQuestions(false);
            setShowStartQuestion(true);
            setShowEndQuestion(false);
            setHasAnsweredEnd(false);
            setSelectedAnswer({ value: null, index: null });
        }
        localStorage.removeItem('feeling_before');
        localStorage.removeItem('feeling_after');
    }, [exercise.id, alreadyCompletedToday]);

    const handleAnswerChange = (e, index) => {
        setSelectedAnswer({
            value: e.target.value,
            index: index + 1,
        });
    };

    const handleSubmitStartQuestion = () => {
        if (selectedAnswer.index !== null) {
            localStorage.setItem('feeling_before', selectedAnswer.index);
            setShowStartQuestion(false);
            setSelectedAnswer({ value: null, index: null });
        } else {
            alert("Selecteer een antwoord voordat je verdergaat.");
        }
    };

    const handleCompletion = () => {
        setIsCompleted(true);
        if (!skipQuestions) {
            setShowEndQuestion(true);
        }
    };

    const handleBack = () => {
        router.visit('/dashboard');
    };

    const handleSubmitEndQuestion = async () => {
        // Sla het antwoord lokaal op
        if (selectedAnswer.index !== null) {
            localStorage.setItem('feeling_after', selectedAnswer.index);
            setHasAnsweredEnd(true);
            setShowEndQuestion(false);

            // Verzamel gegevens om te versturen naar de backend
            const payload = {
                user_id: user.id, // Zorg dat dit beschikbaar is
                exercise_id: exercise.id,
                feeling_before: localStorage.getItem('feeling_before'),
                feeling_after:  localStorage.getItem('feeling_after'),
                // Meesturen hoeveel opties er waren zodat de backend kan normaliseren
                feeling_scale:  feelingScale,
                date_time:      new Date().toISOString(),
            };

            try {
                // Verstuur gegevens naar de backend
                await axios.post(route('exercises.submit'), payload);

                // Verwerk succesvolle reactie
                console.log('Log created successfully');
            } catch (error) {
                // Verwerk fouten
                console.error('Error creating log:', error);
                alert('Er is een fout opgetreden bij het opslaan van je antwoord.');
            }
        } else {
            alert('Selecteer een antwoord voordat je verdergaat.');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Oefening: {exercise.exercise_name}
                </h2>
            }
        >
            <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden">
                    {/* Paarse header met titel */}
                    <div
                        className="px-8 py-6 text-center"
                        style={{ backgroundColor: '#7B5EA7' }}
                    >
                        <h1 className="text-2xl font-bold text-white">
                            {exercise.exercise_name}
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* START VRAAG */}
                        {!skipQuestions && hasQuestions && showStartQuestion && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    {currentQuestion}
                                </h2>
                                <div className="space-y-3">
                                    {currentAnswers.map((answerOption, index) => {
                                        const isSelected = selectedAnswer.index === index + 1;
                                        const text = answerOption.text || answerOption;
                                        const icon = answerOption.icon;
                                        return (
                                            <label
                                                key={index}
                                                htmlFor={`start-answer-${index}`}
                                                className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all"
                                                style={{
                                                    borderColor: isSelected ? '#7B5EA7' : '#D1C4E9',
                                                    backgroundColor: isSelected ? '#F5F0FF' : '#FFFFFF',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    id={`start-answer-${index}`}
                                                    name="start-answer"
                                                    value={text}
                                                    onChange={(e) => handleAnswerChange(e, index)}
                                                    className="sr-only"
                                                />
                                                {icon?.src && (
                                                    <div
                                                        className="flex-shrink-0 flex items-center justify-center rounded-xl"
                                                        style={{ width: '70px', height: '70px', backgroundColor: '#F0E8FF' }}
                                                    >
                                                        <img
                                                            src={icon.src}
                                                            alt={icon.label}
                                                            className="object-contain"
                                                            style={{ width: '50px', height: '50px' }}
                                                        />
                                                    </div>
                                                )}
                                                <span className="text-base font-semibold text-gray-800">
                                                    {text}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={handleSubmitStartQuestion}
                                    className="w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 transition-colors"
                                >
                                    Verder
                                </button>
                            </div>
                        )}

                        {/* GEEN VRAAG MODUS */}
                        {!skipQuestions && !hasQuestions && showStartQuestion && (
                            <div className="text-center text-gray-500">
                                <p>Geen vraag voor deze oefening. Je kunt direct beginnen.</p>
                                <button
                                    onClick={() => setShowStartQuestion(false)}
                                    className="mt-4 w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none transition-colors"
                                >
                                    Begin met oefening
                                </button>
                            </div>
                        )}

                        {/* Herhaalde oefening melding */}
                        {skipQuestions && (
                            <div className="text-center text-blue-600 bg-blue-50 p-4 rounded-lg">
                                <p>Je hebt deze oefening vandaag al gedaan.</p>
                                <p className="text-sm mt-1">Je kunt de audio opnieuw beluisteren.</p>
                            </div>
                        )}

                        {/* AUDIO SECTIE */}
                        {((!skipQuestions && !showStartQuestion) || skipQuestions) && !isCompleted && (
                            <div className="space-y-6">
                                {/* Uitleg tekst */}
                                <div
                                    className="p-5 rounded-xl border-2"
                                    style={{ backgroundColor: '#F0E8FF', borderColor: '#5F5F5F' }}
                                >
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Zoek een rustige plek om te zitten. Druk op de afspeelknop om de mindfulness audio te starten.
                                        Je kunt de audio op pauze zetten en terugspoelen.
                                    </p>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                                    Mindfulness audio
                                </h3>

                                <div
                                    className="p-6 rounded-xl border-4"
                                    style={{ backgroundColor: '#FFFFFF', borderColor: '#7B5EA7' }}
                                >
                                    <AudioControl AudioName={exercise.audio_file_path} />
                                </div>

                                <div className="text-center space-y-4 pt-2">
                                    <p className="text-gray-600 text-sm">
                                        Klaar? Klik dan op de knop hier onder
                                    </p>
                                    <button
                                        onClick={handleCompletion}
                                        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                                    >
                                        Klaar met de oefening
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* EINDE VRAAG */}
                        {!skipQuestions && hasQuestions && showEndQuestion && !hasAnsweredEnd && (
                            <div className="space-y-4 border-t pt-4">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    {currentQuestion}
                                </h2>
                                <div className="space-y-3">
                                    {currentAnswers.map((answerOption, index) => {
                                        const isSelected = selectedAnswer.index === index + 1;
                                        const text = answerOption.text || answerOption;
                                        const icon = answerOption.icon;
                                        return (
                                            <label
                                                key={index}
                                                htmlFor={`end-answer-${index}`}
                                                className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all"
                                                style={{
                                                    borderColor: isSelected ? '#7B5EA7' : '#D1C4E9',
                                                    backgroundColor: isSelected ? '#F5F0FF' : '#FFFFFF',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    id={`end-answer-${index}`}
                                                    name="end-answer"
                                                    value={text}
                                                    onChange={(e) => handleAnswerChange(e, index)}
                                                    className="sr-only"
                                                />
                                                {icon?.src && (
                                                    <div
                                                        className="flex-shrink-0 flex items-center justify-center rounded-xl"
                                                        style={{ width: '70px', height: '70px', backgroundColor: '#F0E8FF' }}
                                                    >
                                                        <img
                                                            src={icon.src}
                                                            alt={icon.label}
                                                            className="object-contain"
                                                            style={{ width: '50px', height: '50px' }}
                                                        />
                                                    </div>
                                                )}
                                                <span className="text-base font-semibold text-gray-800">
                                                    {text}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={handleSubmitEndQuestion}
                                    className="w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 transition-colors"
                                    disabled={hasAnsweredEnd}
                                >
                                    Bevestig antwoord
                                </button>
                            </div>
                        )}

                        {/* AFSLUITENDE BOODSCHAP */}
                        {isCompleted && (
                            <div className="text-center py-4">
                                <p className="text-gray-600">
                                    Super dat je geoefend hebt! Kom je morgen terug?
                                </p>
                            </div>
                        )}

                        {/* TERUG KNOP */}
                        <div className="pt-4">
                            <button
                                onClick={handleBack}
                                className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                            >
                                ← Terug naar mijn cursussen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
