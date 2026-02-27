import { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import AudioControl from "@/Components/AudioControl.jsx";
import {usePage} from "@inertiajs/react";

export default function ExercisePage({ exercise }) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasAnsweredBefore, setHasAnsweredBefore] = useState(false); // Track if the question was answered before exercise
    const [hasAnsweredAfter, setHasAnsweredAfter] = useState(false); // Track if the question was answered after exercise
    const [selectedAnswer, setSelectedAnswer] = useState({value: null, index: null}); // Store selected answer before and after exercise

    const user = usePage().props.auth.user;

    // Load feeling_before from localStorage when component mounts
    useEffect(() => {
        // Load feeling_before from localStorage when component mounts
        const feelingBefore = localStorage.getItem('feeling_before');

        if (feelingBefore) {
            setSelectedAnswer(feelingBefore);
            setHasAnsweredBefore(true); // Mark that the question was already answered
        }

        // Cleanup when leaving the page (remove feeling_before and feeling_after)
        const handleBeforeUnload = () => {
            localStorage.removeItem('feeling_before');
            localStorage.removeItem('feeling_after');
        };

        // Add event listener
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    const handleAnswerChange = (e, index) => {
        console.log(index+1)

        setSelectedAnswer({
            value: e.target.value,
            index: index+1,
        });
    };

    const handleCompletion = () => {
        setIsCompleted(true);
    };

    const handleBack = () => {
        Inertia.visit('/dashboard'); // Terug naar de vorige pagina, of naar '/' als de vorige pagina niet beschikbaar is
    };

    const handleSubmitAnswerBefore = () => {
        if (selectedAnswer) {
            localStorage.setItem('feeling_before', selectedAnswer.index+1);
            setHasAnsweredBefore(true);
        } else {
            alert("Please select an answer.");
        }
    };

    const handleSubmitAnswerAfter = async () => {
        if (selectedAnswer) {
            // Sla het antwoord lokaal op

            console.log(selectedAnswer.index+1)

            localStorage.setItem('feeling_after', selectedAnswer.index+1);
            setHasAnsweredAfter(true);


            // Verzamel gegevens om te versturen naar de backend
            const payload = {
                user_id: user.id, // Zorg dat dit beschikbaar is
                exercise_id: exercise.id,
                feeling_before: localStorage.getItem('feeling_before'),
                feeling_after: localStorage.getItem('feeling_after'),
                date_time: new Date().toISOString(), // Stuur het huidige tijdstip mee
            };

            try {
                // Verstuur gegevens naar de backend
                const response = await axios.post(route('exercises.submit'), payload);

                // Verwerk succesvolle reactie
                console.log('Log created:', response.data);
            } catch (error) {
                // Verwerk fouten
                console.error('Error creating log:', error.response?.data || error.message);
                alert('Er is een fout opgetreden bij het opslaan van je antwoord.');
            }
        } else {
            alert('Please select an answer.');
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
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full space-y-8">
                    {/* Titel */}
                    <h1 className="text-3xl font-bold text-center text-gray-800">
                        {exercise.exercise_name}
                    </h1>

                    <div className="mb-6">


                        {!hasAnsweredBefore && (
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold text-gray-700">
                                    {exercise.form_question}
                                </h2>
                                {Array.isArray(exercise.form_answers) ? (
                                    exercise.form_answers.map((answerOption, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`answer-${index}`}
                                                name="answer"
                                                value={answerOption}
                                                onChange={(e) => handleAnswerChange(e, index)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`answer-${index}`} className="text-sm">
                                                {answerOption}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    JSON.parse(exercise.form_answers).map((answerOption, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`answer-${index}`}
                                                name="answer"
                                                value={answerOption}
                                                onChange={(e) => handleAnswerChange(e, index)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`answer-${index}`} className="text-sm">
                                                {answerOption}
                                            </label>
                                        </div>
                                    ))
                                )}

                                <button
                                    onClick={handleSubmitAnswerBefore}
                                    className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none"
                                    disabled={hasAnsweredBefore}
                                >
                                    Bevestig Antwoord
                                </button>
                            </div>
                        )}


                    </div>

                    {/* Audio Player - Only visible after answering question */}
                    {hasAnsweredBefore && !isCompleted && (
                        <div className="flex justify-center">
                            <AudioControl AudioName={exercise.audio_file_path}/>
                        </div>


                    )}

                    {
                        hasAnsweredBefore && !isCompleted && (
                            <div>
                                <button
                                    onClick={handleCompletion}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 focus:outline-none"
                                >
                                    Oefening Voltooien
                                </button>
                            </div>
                        )
                    }

                    {/* Acties */}
                    <div className="flex flex-col items-center space-y-6">

                        {isCompleted && (
                            <div>
                                <p className="text-sm text-green-600 text-center">
                                    Je hebt de oefening voltooid!
                                </p>
                            </div>
                        )}

                    </div>

                    {/* After completing the exercise, ask the same question again */}
                    {isCompleted && !hasAnsweredAfter && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-700">
                                {exercise.form_question}
                            </h2>
                            <div className="space-y-2">
                                {Array.isArray(exercise.form_answers) ? (
                                    exercise.form_answers.map((answerOption, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`answer-${index}`}
                                                name="answer"
                                                value={answerOption}
                                                onChange={(e) => handleAnswerChange(e, index)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`answer-${index}`}
                                                   className="text-sm">{answerOption}</label>
                                        </div>
                                    ))
                                ) : (
                                    JSON.parse(exercise.form_answers).map((answerOption, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`answer-${index}`}
                                                name="answer"
                                                value={answerOption}
                                                onChange={(e) => handleAnswerChange(e, index)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`answer-${index}`}
                                                   className="text-sm">{answerOption}</label>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button
                                onClick={handleSubmitAnswerAfter}
                                className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none"
                                disabled={hasAnsweredAfter} // Disable button after answering
                            >
                                Bevestig Antwoord
                            </button>

                        </div>
                    )}

                    {isCompleted && hasAnsweredAfter && (
                        <div className="flex justify-center">
                            <p>Super dat je geoefend hebt! Kom je morgen terug?</p>
                        </div>
                    )}

                    <div>
                        <button
                            onClick={handleBack}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 focus:outline-none"
                        >
                            Deze oefening afsluiten
                        </button>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
