import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import AudioControl from "@/Components/AudioControl.jsx";
import axios from 'axios';

function AnswerOption({ id, name, text, icon, isSelected, onChange }) {
    return (
        <label
            htmlFor={id}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all"
            style={{
                borderColor: isSelected ? '#7B5EA7' : '#D1C4E9',
                backgroundColor: isSelected ? '#F5F0FF' : '#FFFFFF',
            }}
        >
            <input
                type="radio"
                id={id}
                name={name}
                value={text}
                onChange={onChange}
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
            <span className="text-base font-semibold text-gray-800">{text}</span>
        </label>
    );
}

// ---------------------------------------------------------------------------
// Twee-stappen gevoelsvraag (alleen actief bij precies 5 antwoorden)
//
// Verwacht antwoorden geordend van slechtst → best:
//   index 0 = "Zeer slecht"   → waarde 1
//   index 1 = "Een beetje slecht" → waarde 2
//   index 2 = "Neutraal"      → waarde 3  (middenpunt → direct klaar)
//   index 3 = "Een beetje goed"  → waarde 4
//   index 4 = "Zeer goed"     → waarde 5
//
// Bij 3 of 4 antwoorden: gewone enkelvoudige lijst (geen twee stappen).
// ---------------------------------------------------------------------------
function FeelingQuestion({ question, answers, namePrefix, onConfirm }) {
    const isTwoStep = answers.length === 5;

    // Stap 1: "Slecht" | "Neutraal" | "Goed"
    const [globalChoice, setGlobalChoice] = useState(null); // 'bad' | 'neutral' | 'good'
    // Stap 2: verfijning
    const [refinedIndex, setRefinedIndex] = useState(null); // 0-based index in originele array

    // Enkelvoudige modus (3-4 opties)
    const [singleIndex, setSingleIndex] = useState(null);

    // -- Stap 1: kies globaal
    const handleGlobalChoice = (choice, directIndex) => {
        if (choice === 'neutral') {
            // Neutraal = index 2 (1-based: 3) → direct bevestigen
            onConfirm(directIndex + 1);
        } else {
            setGlobalChoice(choice);
        }
    };

    // -- Stap 2: kies verfijning
    const handleRefinedChoice = (index) => {
        setRefinedIndex(index);
    };

    const handleConfirmRefined = () => {
        if (refinedIndex === null) {
            alert('Selecteer een antwoord voordat je verdergaat.');
            return;
        }
        onConfirm(refinedIndex + 1); // 1-based waarde
    };

    // -- Enkelvoudig bevestigen
    const handleConfirmSingle = () => {
        if (singleIndex === null) {
            alert('Selecteer een antwoord voordat je verdergaat.');
            return;
        }
        onConfirm(singleIndex + 1);
    };

    // Ga terug naar stap 1
    const handleBack = () => {
        setGlobalChoice(null);
        setRefinedIndex(null);
    };

    // ---- Render: enkelvoudige modus ----------------------------------------
    if (!isTwoStep) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">{question}</h2>
                <div className="space-y-3">
                    {answers.map((answerOption, index) => {
                        const text = answerOption.text || answerOption;
                        const icon = answerOption.icon;
                        return (
                            <AnswerOption
                                key={index}
                                id={`${namePrefix}-${index}`}
                                name={namePrefix}
                                text={text}
                                icon={icon}
                                isSelected={singleIndex === index}
                                onChange={() => setSingleIndex(index)}
                            />
                        );
                    })}
                </div>
                <button
                    onClick={handleConfirmSingle}
                    className="w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 transition-colors"
                >
                    Verder
                </button>
            </div>
        );
    }

    // ---- Render: twee-stappen modus ----------------------------------------

    // Stap 2 — verfijning
    if (globalChoice !== null) {
        const refinedAnswers = globalChoice === 'bad'
            ? [{ answer: answers[0], index: 0 }, { answer: answers[1], index: 1 }]
            : [{ answer: answers[3], index: 3 }, { answer: answers[4], index: 4 }];

        return (
            <div className="space-y-4">
                <button
                    onClick={handleBack}
                    className="text-sm text-[#7B5EA7] hover:underline flex items-center gap-1"
                >
                    ← Terug
                </button>
                <h2 className="text-lg font-semibold text-gray-700">{question}</h2>
                <div className="space-y-3">
                    {refinedAnswers.map(({ answer, index }) => {
                        const text = answer.text || answer;
                        const icon = answer.icon;
                        return (
                            <AnswerOption
                                key={index}
                                id={`${namePrefix}-refined-${index}`}
                                name={`${namePrefix}-refined`}
                                text={text}
                                icon={icon}
                                isSelected={refinedIndex === index}
                                onChange={() => handleRefinedChoice(index)}
                            />
                        );
                    })}
                </div>
                <button
                    onClick={handleConfirmRefined}
                    className="w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 transition-colors"
                >
                    Bevestigen
                </button>
            </div>
        );
    }

    // Stap 1 — globale keuze
    // Eerste antwoord = "Slecht", middelste = "Neutraal", laatste = "Goed"
    const globalOptions = [
        { answer: answers[0], choice: 'bad',    directIndex: null },
        { answer: answers[2], choice: 'neutral', directIndex: 2   },
        { answer: answers[4], choice: 'good',    directIndex: null },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">{question}</h2>
            <div className="space-y-3">
                {globalOptions.map(({ answer, choice, directIndex }, i) => {
                    const text = answer?.text || answer;
                    const icon = answer?.icon;
                    return (
                        <button
                            key={i}
                            onClick={() => handleGlobalChoice(choice, directIndex)}
                            className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all text-left bg-white hover:bg-[#F5F0FF] border-[#D1C4E9] hover:border-[#7B5EA7]"
                        >
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
                            <span className="text-base font-semibold text-gray-800">{text}</span>
                            {choice === 'neutral' && (
                                <span className="ml-auto text-xs text-gray-400 italic">direct verder</span>
                            )}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-gray-400 text-center">
                Kies een optie — bij Slecht of Goed volgt een tweede stap.
            </p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Hoofdpagina
// ---------------------------------------------------------------------------
export default function ExercisePage({ exercise, researchMode, researchQuestion, researchAnswers, alreadyCompletedToday }) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [showStartQuestion, setShowStartQuestion] = useState(true);
    const [showEndQuestion, setShowEndQuestion] = useState(false);
    const [hasAnsweredEnd, setHasAnsweredEnd] = useState(false);
    const [skipQuestions, setSkipQuestions] = useState(false);

    // Bewaar de numerieke waarde (1-based) die door FeelingQuestion wordt teruggegeven
    const [feelingBefore, setFeelingBefore] = useState(null);

    // Bijhouden hoe lang de gebruiker met de audio bezig is geweest
    const sessionStartRef = useRef(null);

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
    const feelingScale    = currentAnswers?.length ?? 5;

    useEffect(() => {
        if (alreadyCompletedToday) {
            setSkipQuestions(true);
            setShowStartQuestion(false);
            setShowEndQuestion(false);
            setHasAnsweredEnd(true);
            setFeelingBefore(null);
        } else {
            setSkipQuestions(false);
            setShowStartQuestion(true);
            setShowEndQuestion(false);
            setHasAnsweredEnd(false);
            setFeelingBefore(null);
        }
        // localStorage alleen nog als tijdelijke brug; zie opmerking onderaan
        localStorage.removeItem('feeling_before');
        localStorage.removeItem('feeling_after');
    }, [exercise.id, alreadyCompletedToday]);

    // Startvraag bevestigd → ga door naar audio
    const handleConfirmStart = (valueOneBased) => {
        setFeelingBefore(valueOneBased);
        localStorage.setItem('feeling_before', valueOneBased); // compat
        setShowStartQuestion(false);
        // Start sessietimer zodra gebruiker doorgaat naar audio
        sessionStartRef.current = Date.now();
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

    const handleConfirmEnd = async (valueOneBased) => {
        localStorage.setItem('feeling_after', valueOneBased); // compat

        const sessionDurationSeconds = sessionStartRef.current
            ? Math.round((Date.now() - sessionStartRef.current) / 1000)
            : 0;


        const payload = {
            user_id:          user.id, // zorg dat dit beschikbaar is
            exercise_id:      exercise.id,
            feeling_before:   feelingBefore,
            feeling_after:    valueOneBased,
            // Meesturen hoeveel opties er waren zodat de backend kan berekenen
            feeling_scale:    feelingScale,
            session_duration: sessionDurationSeconds,
            date_time:        new Date().toISOString(),
        };

        try {
            await axios.post(route('exercises.submit'), payload);
            console.log('Log created successfully');
        } catch (error) {
            console.error('Error creating log:', error);
            alert('Er is een fout opgetreden bij het opslaan van je antwoord.');
        }

        setHasAnsweredEnd(true);
        setShowEndQuestion(false);
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
                    {/* Paarse header */}
                    <div className="px-8 py-6 text-center" style={{ backgroundColor: '#7B5EA7' }}>
                        <h1 className="text-2xl font-bold text-white">{exercise.exercise_name}</h1>
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
