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

export default function ExercisePage({
                                         exercise,
                                         availability = {},
                                         research = {},
                                         proxy = {},
                                     }) {
    // Destructure grouped props
    const { available, availableLabel, alreadyCompletedToday, isNewestExercise } = availability;
    const { mode: researchMode, question: researchQuestion, answers: researchAnswers } = research;
    const { forUserId, isProxyMode, feelingAnsweredToday: proxyFeelingAnsweredToday } = proxy;

    const [isCompleted,       setIsCompleted]       = useState(false);
    const [showStartQuestion, setShowStartQuestion] = useState(true);
    const [showEndQuestion,   setShowEndQuestion]   = useState(false);
    const [hasAnsweredEnd,    setHasAnsweredEnd]     = useState(false);
    const [skipQuestions,     setSkipQuestions]     = useState(false);
    const [showCompletion,    setShowCompletion]     = useState(false);

    const [feelingBefore, setFeelingBefore] = useState(null);

    const sessionStartRef = useRef(null);
    const user = usePage().props.auth.user;

    const effectiveUserId = forUserId || user.id;
    const isProxy         = isProxyMode || (forUserId && forUserId !== user.id);

    const proxyCanAskFeelings = isProxy && isNewestExercise && !proxyFeelingAnsweredToday;

    // Vraag & antwoorden bepalen
    const getQuestion = () => {
        if (researchMode === 'per_exercise' && researchQuestion) return researchQuestion;
        if (researchMode === 'per_session'  && researchQuestion) return researchQuestion;
        return exercise.form_question;
    };

    const getAnswers = () => {
        if ((researchMode === 'per_exercise' || researchMode === 'per_session') && researchAnswers) {
            return typeof researchAnswers === 'string'
                ? JSON.parse(researchAnswers)
                : researchAnswers;
        }
        return typeof exercise.form_answers === 'string'
            ? JSON.parse(exercise.form_answers)
            : exercise.form_answers;
    };

    const currentQuestion = getQuestion();
    const currentAnswers  = getAnswers();
    const hasQuestions    = currentQuestion && currentAnswers && currentAnswers.length > 0;
    const feelingScale    = currentAnswers?.length ?? 5;

    const durationLabel = formatDuration(exercise.duration ?? null);

    useEffect(() => {
        const shouldSkip = !isProxy && (alreadyCompletedToday || !isNewestExercise);
        setSkipQuestions(shouldSkip);

        if (shouldSkip) {
            setShowStartQuestion(false);
            setShowEndQuestion(false);
            setHasAnsweredEnd(true);
            setFeelingBefore(null);
        } else {
            setShowStartQuestion(true);
            setShowEndQuestion(false);
            setHasAnsweredEnd(false);
            setFeelingBefore(null);
            setShowCompletion(false);
            setIsCompleted(false);
        }
    }, [exercise.id, alreadyCompletedToday, isProxy]);

    const handleConfirmStart = (valueOneBased) => {
        setFeelingBefore(valueOneBased);
        setShowStartQuestion(false);
        sessionStartRef.current = Date.now();
    };

    const handleSkipStart = () => {
        setShowStartQuestion(false);
        sessionStartRef.current = Date.now();
    };

    const handleCompletion = () => {
        setIsCompleted(true);
        const shouldShowEndQuestion = hasQuestions && !skipQuestions && (!isProxy || proxyCanAskFeelings);
        if (shouldShowEndQuestion) {
            setShowEndQuestion(true);
        } else {
            saveLog(null);
        }
    };

    const handleBack = () => router.visit('/dashboard');

    const saveLog = async (feelingAfter) => {
        const sessionDurationSeconds = sessionStartRef.current
            ? Math.round((Date.now() - sessionStartRef.current) / 1000)
            : 0;

        const payload = {
            user_id:          effectiveUserId,
            exercise_id:      exercise.id,
            feeling_before:   feelingBefore   ?? null,
            feeling_after:    feelingAfter    ?? null,
            feeling_scale:    hasQuestions ? feelingScale : null,
            session_duration: sessionDurationSeconds,
            date_time:        new Date().toISOString(),
        };

        try {
            await axios.post(route('exercises.submit'), payload);
            setShowCompletion(true);
        } catch (error) {
            console.error('Error creating log:', error);
            alert('Er is een fout opgetreden bij het opslaan.');
        }
    };

    const handleConfirmEnd = async (valueOneBased) => {
        setHasAnsweredEnd(true);
        setShowEndQuestion(false);
        await saveLog(valueOneBased);
    };

    const isAvailable = available !== false;

    if (!isAvailable) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden p-8">
                        <div className="text-center space-y-4">
                            <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-800">Oefening nog niet beschikbaar</h3>
                            <p className="text-gray-600">
                                {availableLabel || 'Maak eerst de vorige oefening.'}
                            </p>
                            {isProxy && (
                                <p className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
                                    Deze oefening is voor deze cliënt nog niet beschikbaar.
                                </p>
                            )}
                            <button
                                onClick={handleBack}
                                className="mt-6 w-full py-3 px-4 bg-[#7B5EA7] text-white font-semibold rounded-xl shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                            >
                                Terug naar dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (showCompletion) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden p-8">
                        <CompletionScreen
                            userName={isProxy ? 'de cliënt' : user.name}
                            onBack={handleBack}
                        />
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                isProxy ? (
                    <p className="text-sm text-purple-600">
                        Je doet deze oefening samen met je cliënt (ID: {forUserId})
                    </p>
                ) : null
            }
        >
            <div className="flex items-center justify-center bg-gray-100 py-6 px-4">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">

                    {/* Paarse header */}
                    <div className="px-8 py-5 text-center" style={{ backgroundColor: '#7B5EA7' }}>
                        <h1 className="text-3xl font-bold text-white">
                            Oefening: {exercise.exercise_name}
                        </h1>

                        {/* Timing label: voor / na */}
                        {showStartQuestion && !showEndQuestion && !isCompleted && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-2" style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '2px solid rgba(0,0,0,0.35)' }}>
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                                </svg>
                                <span className="text-base font-bold text-white">Vraag vóór de oefening</span>
                            </div>
                        )}
                        {showEndQuestion && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-2" style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '2px solid rgba(0,0,0,0.35)' }}>
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <span className="text-base font-bold text-white">Vraag na de oefening</span>
                            </div>
                        )}
                        {durationLabel && (
                            <div className="flex items-center justify-center gap-1.5 mt-3">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-white">De oefening duurt ongeveer {durationLabel}</span>
                            </div>
                        )}
                        {isProxy && (
                            <div className="mt-3 text-xs font-semibold text-white bg-white bg-opacity-20 rounded-lg px-3 py-1 inline-block">
                                Begeleider-modus — namens cliënt
                            </div>
                        )}
                    </div>

                    <div className="p-6 space-y-4">

                        {/* STARTVRAAG */}
                        {!skipQuestions && hasQuestions && showStartQuestion && (!isProxy || proxyCanAskFeelings) && (
                            <div>
                                {isProxy && (
                                    <p className="text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                                        <strong>Begeleider:</strong> Vraag de cliënt hoe zij/hij zich voelt <em>voor</em> de oefening en vul het in.
                                    </p>
                                )}
                                <FeelingQuestion
                                    question={currentQuestion}
                                    answers={currentAnswers}
                                    namePrefix="start-answer"
                                    onConfirm={handleConfirmStart}
                                />
                            </div>
                        )}

                        {isProxy && !proxyCanAskFeelings && showStartQuestion && (
                            <div>
                                {proxyFeelingAnsweredToday && isNewestExercise && (
                                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                        Je hebt vandaag al een gevoelsmeting voor deze cliënt ingevuld. De oefening kan opnieuw gedaan worden zonder nieuwe meting.
                                    </div>
                                )}
                                {!isNewestExercise && (
                                    <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                        Gevoelsvragen worden alleen gesteld bij de nieuwste oefening van de cliënt.
                                    </div>
                                )}
                                <div className="text-center">
                                    <button
                                        onClick={handleSkipStart}
                                        className="w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none transition-colors"
                                    >
                                        Begin met oefening
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Geen vraag */}
                        {!skipQuestions && !hasQuestions && showStartQuestion && !isProxy && (
                            <div className="text-center text-gray-500">
                                <p>Geen gevoelsvraag voor deze oefening. Je kunt direct beginnen.</p>
                                <button
                                    onClick={handleSkipStart}
                                    className="mt-4 w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none transition-colors"
                                >
                                    Begin met oefening
                                </button>
                            </div>
                        )}

                        {/* Herhaalde oefening melding (cliënt) */}
                        {!isProxy && skipQuestions && (
                            <div className="flex items-center gap-4 p-4 rounded-xl border-2" style={{ backgroundColor: '#F0E8FF', borderColor: '#7B5EA7' }}>
                                <svg className="w-9 h-9 flex-shrink-0" style={{ color: '#7B5EA7' }} fill="currentColor" viewBox="0 0 24 24" role="img" aria-label="Al gedaan vandaag">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <p className="text-sm font-medium" style={{ color: '#3B2D6E' }}>
                                    Je hebt deze oefening vandaag al gedaan. Je kunt de audio opnieuw beluisteren.
                                </p>
                            </div>
                        )}

                        {/* Vandaag al gedaan door cliënt maar begeleider mag altijd verder */}
                        {isProxy && alreadyCompletedToday && (
                            <div className="text-center text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                <p className="font-medium">Deze cliënt heeft deze oefening vandaag al gedaan.</p>
                                <p className="text-sm mt-1">Je kunt de oefening toch opnieuw doen en de audio beluisteren.</p>
                            </div>
                        )}

                        {/* AUDIO SECTIE */}
                        {!showStartQuestion && !isCompleted && (
                            <div className="space-y-4">
                                <div className="p-5 rounded-xl border-2" style={{ backgroundColor: '#F0E8FF', borderColor: '#7B5EA7' }}>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#7B5EA7' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                        </svg>
                                        <p className="text-sm font-medium" style={{ color: '#3B2D6E' }}>
                                            Zoek een rustige plek. Je kunt de audio pauzeren en terugspoelen.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-xl border-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#7B5EA7' }}>
                                    <h2 className="text-base font-semibold text-gray-700 mb-3"><span lang="en">Mindfulness</span> audio</h2>
                                    <AudioControl AudioName={exercise.audio_file_path} />
                                </div>

                                <button
                                    onClick={handleCompletion}
                                    className="w-full py-3 px-4 bg-green-700 text-white font-semibold rounded-xl shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-200"
                                >
                                    Klaar met de oefening
                                </button>
                            </div>
                        )}

                        {/* EINDVRAAG */}
                        {hasQuestions && showEndQuestion && !hasAnsweredEnd && (!isProxy || proxyCanAskFeelings) && (
                            <div className="space-y-4 border-t pt-4">
                                {isProxy && (
                                    <p className="text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3">
                                        <strong>Begeleider:</strong> Vraag de cliënt hoe zij/hij zich voelt <em>na</em> de oefening en vul het in.
                                    </p>
                                )}
                                <FeelingQuestion
                                    question={currentQuestion}
                                    answers={currentAnswers}
                                    namePrefix="end-answer"
                                    onConfirm={handleConfirmEnd}
                                />
                            </div>
                        )}

                        {/* Terugknop na voltooiing */}
                        {isCompleted && !showEndQuestion && !showCompletion && (
                            <div className="text-center space-y-4 border-t pt-6">
                                <p className="text-green-600 font-semibold">✓ Oefening klaar!</p>
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
