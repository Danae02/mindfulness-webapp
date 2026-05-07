import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import AudioControl from "@/Components/AudioControl.jsx";
import AudioButton from "@/Components/AudioButton.jsx";
import FeelingQuestion from "@/Components/FeelingQuestion.jsx";
import CompletionScreen from "@/Components/CompletionScreen.jsx";
import axios from 'axios';

function formatDuration(minutes) {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} u ${m} min` : `${h} uur`;
}

export default function ExercisePage({ exercise, researchMode, researchQuestion, researchAnswers, alreadyCompletedToday }) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [showStartQuestion, setShowStartQuestion] = useState(true);
    const [showEndQuestion, setShowEndQuestion] = useState(false);
    const [hasAnsweredEnd, setHasAnsweredEnd] = useState(false);
    const [skipQuestions, setSkipQuestions] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);

    const [feelingBefore, setFeelingBefore] = useState(null);

    const sessionStartRef = useRef(null);

    const user = usePage().props.auth.user;

    const getQuestion = () => {
        if (researchMode === 'per_exercise' && researchQuestion) return researchQuestion;
        return exercise.form_question;
    };

    const getAnswers = () => {
        if (researchMode === 'per_exercise' && researchAnswers) {
            return typeof researchAnswers === 'string' ? JSON.parse(researchAnswers) : researchAnswers;
        }
        return typeof exercise.form_answers === 'string'
            ? JSON.parse(exercise.form_answers)
            : exercise.form_answers;
    };

    const currentQuestion = getQuestion();
    const currentAnswers  = getAnswers();
    const hasQuestions    = currentQuestion && currentAnswers && currentAnswers.length > 0;
    const feelingScale    = currentAnswers?.length ?? 5;

    // Duur: vanuit de database (in minuten), of null als onbekend
    const durationLabel = formatDuration(exercise.duration ?? null);

    useEffect(() => {
        if (alreadyCompletedToday) {
            setSkipQuestions(true);
            setShowStartQuestion(false);
            setShowEndQuestion(false);
            setHasAnsweredEnd(true);
            setFeelingBefore(null);
            setShowCompletion(false);
        } else {
            setSkipQuestions(false);
            setShowStartQuestion(true);
            setShowEndQuestion(false);
            setHasAnsweredEnd(false);
            setFeelingBefore(null);
            setShowCompletion(false);
        }
        localStorage.removeItem('feeling_before');
        localStorage.removeItem('feeling_after');
    }, [exercise.id, alreadyCompletedToday]);

    // Startvraag bevestigd en ga door naar audio
    const handleConfirmStart = (valueOneBased) => {
        setFeelingBefore(valueOneBased);
        localStorage.setItem('feeling_before', valueOneBased);
        setShowStartQuestion(false);
        sessionStartRef.current = Date.now();
    };

    const handleCompletion = () => {
        setIsCompleted(true);
        if (!skipQuestions) setShowEndQuestion(true);
    };

    const handleBack = () => router.visit('/dashboard');

    const handleConfirmEnd = async (valueOneBased) => {
        localStorage.setItem('feeling_after', valueOneBased);

        const sessionDurationSeconds = sessionStartRef.current
            ? Math.round((Date.now() - sessionStartRef.current) / 1000)
            : 0;

        const payload = {
            user_id:          user.id,
            exercise_id:      exercise.id,
            feeling_before:   feelingBefore,
            feeling_after:    valueOneBased,
            feeling_scale:    feelingScale,
            session_duration: sessionDurationSeconds,
            date_time:        new Date().toISOString(),
        };

        try {
            await axios.post(route('exercises.submit'), payload);
            setShowCompletion(true);
        } catch (error) {
            console.error('Error creating log:', error);
            alert('Er is een fout opgetreden bij het opslaan van je antwoord.');
        }

        setHasAnsweredEnd(true);
        setShowEndQuestion(false);
    };

    // render afsluitende scherm
    if (showCompletion) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Oefening voltooid
                    </h2>
                }
            >
                <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden p-8">
                        <CompletionScreen userName={user.name} onBack={handleBack} />
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

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
                    {/* Paarse header */}
                    <div className="px-8 py-6 text-center" style={{ backgroundColor: '#7B5EA7' }}>
                        <h1 className="text-2xl font-bold text-white">{exercise.exercise_name}</h1>

                        {/* lengte van oefening */}
                        {durationLabel && (
                            <div className="flex items-center justify-center gap-1.5 mt-2">
                                <svg
                                    className="w-4 h-4 text-purple-200"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-purple-100">
                                    Ongeveer {durationLabel}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-8 space-y-6">

                        {/* START VRAAG */}
                        {!skipQuestions && hasQuestions && showStartQuestion && (
                            <FeelingQuestion
                                question={currentQuestion}
                                answers={currentAnswers}
                                namePrefix="start-answer"
                                onConfirm={handleConfirmStart}
                            />
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
                                {/* instructie audio */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
                                    <span className="text-sm text-gray-600">Beluister de instructie:</span>
                                    <AudioButton
                                        audioFile="/audio/ElevenLabs_instructie_ oefening.mp3"
                                        label="Lees voor"
                                    />
                                </div>

                                <div
                                    className="p-5 rounded-xl border-2"
                                    style={{ backgroundColor: '#F0E8FF', borderColor: '#5F5F5F' }}
                                >
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Zoek een rustige plek om te zitten. Druk op de afspeelknop om de mindfulness audio te starten.
                                        Je kunt de audio op pauze zetten en terugspoelen.
                                    </p>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-700 mb-3">Mindfulness audio</h3>

                                <div className="p-6 rounded-xl border-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#7B5EA7' }}>
                                    <AudioControl AudioName={exercise.audio_file_path} />
                                </div>

                                <div className="text-center space-y-4 pt-2">
                                    <p className="text-gray-600 text-sm">Klaar? Klik dan op de knop hier onder</p>
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
                                <FeelingQuestion
                                    question={currentQuestion}
                                    answers={currentAnswers}
                                    namePrefix="end-answer"
                                    onConfirm={handleConfirmEnd}
                                />
                            </div>
                        )}

                        {/* toon terugknop na voltooiing */}
                        {isCompleted && !showEndQuestion && !showCompletion && (
                            <div className="text-center space-y-4 border-t pt-6">
                                <p className="text-green-600 font-semibold">✓ Oefening voltooid!</p>
                                <button
                                    onClick={handleBack}
                                    className="w-full py-3 px-4 bg-[#7B5EA7] text-white font-semibold rounded-xl shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    Terug naar dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
