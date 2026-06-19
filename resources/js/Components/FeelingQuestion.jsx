import { useState, useRef, useEffect } from 'react';

export default function FeelingQuestion({ question, answers, namePrefix, onConfirm, exerciseName, timingLabel }) {
    const isTwoStep = answers.length === 5;

    const isStart = namePrefix?.startsWith("start");
    const computedTimingLabel = timingLabel ?? (isStart ? "Vóór de oefening" : "Na de oefening");
    const fullSrAnnouncement = exerciseName
        ? `Oefening: ${exerciseName}. ${computedTimingLabel}. ${question}`
        : `${computedTimingLabel}. ${question}`;
    const timingIcon = isStart
        ? "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" // check
        : "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"; // done

    // Stap 1: "Slecht", "Neutraal", "Goed"
    const [globalChoice, setGlobalChoice] = useState(null);
    // Stap 2: verfijning
    const [refinedIndex, setRefinedIndex] = useState(null);

    // Enkelvoudige modus (3-4 opties)
    const [singleIndex, setSingleIndex] = useState(null);

    // Focus management
    const [focusedIndex, setFocusedIndex] = useState(0);
    const buttonRefsGlobal = useRef([]);
    const buttonRefsRefined = useRef([]);

    // Stap 1: kies globaal
    const handleGlobalChoice = (choice, directIndex) => {
        if (choice === 'neutral') {
            // Neutraal = index 2 (1-based: 3) dus direct bevestigen
            onConfirm(directIndex + 1);
        } else {
            setGlobalChoice(choice);
        }
    };

    // Stap 2: kies verfijning
    const handleRefinedChoice = (index) => {
        setRefinedIndex(index);
    };

    const handleConfirmRefined = () => {
        if (refinedIndex === null) {
            alert('Selecteer een antwoord voordat je verdergaat.');
            return;
        }
        const globalChoice_ = globalChoice === 'bad' ? refinedIndex : refinedIndex + 3;
        onConfirm(globalChoice_ + 1);
    };

    // enkelvoudig bevestigen
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
        setFocusedIndex(0);
    };

    // voor screenreader en keyboard: Twee-stappen modus: globale keuze (pijltjestoetsen)
    const handleGlobalKeyDown = (e, index) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = (index + 1) % 3;
            setFocusedIndex(next);
            buttonRefsGlobal.current[next]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = (index - 1 + 3) % 3;
            setFocusedIndex(prev);
            buttonRefsGlobal.current[prev]?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const globalOptions = [
                { answer: answers[0], choice: 'bad', directIndex: null },
                { answer: answers[2], choice: 'neutral', directIndex: 2 },
                { answer: answers[4], choice: 'good', directIndex: null },
            ];
            const { choice, directIndex } = globalOptions[index];
            handleGlobalChoice(choice, directIndex);
        }
    };

    const handleRefinedKeyDown = (e, index) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = (index + 1) % 2;
            setRefinedIndex(next);
            buttonRefsRefined.current[next]?.focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = (index - 1 + 2) % 2;
            setRefinedIndex(prev);
            buttonRefsRefined.current[prev]?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRefinedChoice(index);
        }
    };

    const handleSingleKeyDown = (e, index) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = Math.min(index + 1, answers.length - 1);
            setSingleIndex(next);
            buttonRefsGlobal.current[next]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = Math.max(index - 1, 0);
            setSingleIndex(prev);
            buttonRefsGlobal.current[prev]?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onConfirm(index + 1);
        }
    };

    // Zet focus op eerste element als index verandert
    useEffect(() => {
        if (globalChoice === null && buttonRefsGlobal.current[focusedIndex]) {
            buttonRefsGlobal.current[focusedIndex]?.focus();
        }
    }, [globalChoice, focusedIndex]);

    useEffect(() => {
        if (globalChoice !== null && refinedIndex !== null && buttonRefsRefined.current[refinedIndex]) {
            buttonRefsRefined.current[refinedIndex]?.focus();
        }
    }, [globalChoice, refinedIndex]);

    // Zet alleen focus (zonder de keuze te markeren) zodra de verfijningsstap verschijnt
    useEffect(() => {
        if (globalChoice !== null && refinedIndex === null) {
            buttonRefsRefined.current[0]?.focus();
        }
    }, [globalChoice, refinedIndex]);

    // enkelvoudige modus
    if (!isTwoStep) {
        return (
            <div className="space-y-4">
                <p className="sr-only" role="alert">{fullSrAnnouncement}</p>
                <h2 className="text-lg font-semibold text-gray-700">{question}</h2>
                <p id={`${namePrefix}-hint`} className="sr-only">
                    Gebruik de pijltjestoetsen (↑ omhoog, ↓ omlaag) om tussen opties te navigeren.
                    Druk op Enter of Spatie om te selecteren.
                </p>
                <fieldset
                    className="space-y-3"
                    aria-labelledby={`${namePrefix}-legend`}
                    aria-describedby={`${namePrefix}-hint`}
                >
                    <legend id={`${namePrefix}-legend`} className="sr-only">{question}</legend>
                    {answers.map((answerOption, index) => {
                        const text = answerOption.text || answerOption;
                        const icon = answerOption.icon;
                        return (
                            <div key={index} className="flex items-stretch">
                                <button
                                    ref={el => buttonRefsGlobal.current[index] = el}
                                    onClick={() => {
                                        setSingleIndex(index);
                                        onConfirm(index + 1);
                                    }}
                                    onKeyDown={(e) => handleSingleKeyDown(e, index)}
                                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer text-left
                                        ${singleIndex === index
                                        ? 'bg-purple-100 border-[#7B5EA7] ring-2 ring-[#7B5EA7] ring-offset-2'
                                        : 'bg-white border-gray-300 hover:border-purple-300'
                                    }
                                        focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2`}
                                    aria-pressed={singleIndex === index}
                                    aria-label={text}
                                >
                                    {icon?.src && (
                                        <img
                                            src={icon.src}
                                            alt=""
                                            role="presentation"
                                            className="w-12 h-12 object-contain flex-shrink-0"
                                        />
                                    )}
                                    <span className="font-semibold text-gray-800">{text}</span>
                                </button>
                            </div>
                        );
                    })}
                </fieldset>
                <button
                    onClick={handleConfirmSingle}
                    className="w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 transition-colors"
                    aria-label="Geselecteerde antwoord bevestigen en verder"
                >
                    Verder
                </button>
            </div>
        );
    }

    // twee-stappen modus, verfijning (STAP 2)
    if (globalChoice !== null) {
        const refinedAnswers = globalChoice === 'bad'
            ? [{ answer: answers[0], index: 0 }, { answer: answers[1], index: 1 }]
            : [{ answer: answers[3], index: 3 }, { answer: answers[4], index: 4 }];

        const hintId = `${namePrefix}-refined-hint`;

        return (
            <div className="space-y-4">
                <button
                    onClick={handleBack}
                    className="text-sm text-[#7B5EA7] hover:text-[#6a4e8e] hover:underline flex items-center gap-1 px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                    aria-label="Terug naar vorige stap van de gevoelsvraag"
                >
                    ← Terug
                </button>
                <h2 className="text-lg font-semibold text-gray-700">{question}</h2>
                <p
                    id={hintId}
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    Kies nu nog tussen twee opties. Gebruik de pijltjestoetsen (↑ omhoog, ↓ omlaag)
                    om te navigeren. Druk op Enter of Spatie om te selecteren.
                    Gebruik daarna Tab om naar de bevestigknop te gaan.
                </p>

                <fieldset
                    className="space-y-3"
                    aria-describedby={hintId}
                    aria-label={`Verfijning van: ${question}`}
                >
                    <legend className="sr-only">Kies een van deze twee opties</legend>
                    {refinedAnswers.map(({ answer, index }, displayIndex) => {
                        const text = answer.text || answer;
                        const icon = answer.icon;
                        return (
                            <button
                                key={index}
                                ref={el => buttonRefsRefined.current[displayIndex] = el}
                                onClick={() => handleRefinedChoice(displayIndex)}
                                onKeyDown={(e) => handleRefinedKeyDown(e, displayIndex)}
                                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer text-left
                                    ${refinedIndex === displayIndex
                                    ? 'bg-purple-100 border-[#7B5EA7] ring-2 ring-[#7B5EA7] ring-offset-2'
                                    : 'bg-white border-gray-300 hover:border-purple-300'
                                }
                                    focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2`}
                                aria-pressed={refinedIndex === displayIndex}
                                aria-label={text}
                            >
                                {icon?.src && (
                                    <img
                                        src={icon.src}
                                        alt=""
                                        className="w-12 h-12 object-contain flex-shrink-0"
                                    />
                                )}
                                <span className="font-semibold text-gray-800">{text}</span>
                            </button>
                        );
                    })}
                </fieldset>
                <button
                    onClick={handleConfirmRefined}
                    className="w-full py-2 px-4 bg-[#7B5EA7] text-white rounded-md shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 transition-colors"
                    aria-label="Geselecteerde antwoord bevestigen en verder naar volgende onderdeel"
                >
                    Bevestigen
                </button>
            </div>
        );
    }

    // twee-stappen modus, globale keuze (stap 1)
    const globalOptions = [
        { answer: answers[0], choice: 'bad', directIndex: null },
        { answer: answers[2], choice: 'neutral', directIndex: 2 },
        { answer: answers[4], choice: 'good', directIndex: null },
    ];

    return (
        <div className="space-y-4">
            <p className="sr-only" role="alert">{fullSrAnnouncement}</p>
            <h2 className="text-lg font-semibold text-gray-700">{question}</h2>
            <p id={`${namePrefix}-hint`} className="sr-only">
                Kies een van drie opties. Gebruik de pijltjestoetsen (omhoog of omlaag) om te navigeren.
            </p>
            <fieldset
                role="group"
                aria-labelledby={`${namePrefix}-legend`}
                aria-describedby={`${namePrefix}-hint ${namePrefix}-extra-hint`}
                className="space-y-3"
            >
                <legend id={`${namePrefix}-legend`} className="sr-only">
                    {question} – kies een van drie opties
                </legend>
                {globalOptions.map(({ answer, choice, directIndex }, i) => {
                    const text = answer?.text || answer;
                    const icon = answer?.icon;
                    const isNeutral = choice === 'neutral';
                    return (
                        <button
                            key={i}
                            ref={el => buttonRefsGlobal.current[i] = el}
                            onClick={() => handleGlobalChoice(choice, directIndex)}
                            onKeyDown={(e) => handleGlobalKeyDown(e, i)}
                            className={`flex items-center gap-4 w-full px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all text-left
                                ${focusedIndex === i
                                ? 'bg-purple-100 border-[#7B5EA7] ring-2 ring-[#7B5EA7] ring-offset-2'
                                : 'bg-white hover:bg-[#F5F0FF] border-[#D1C4E9] hover:border-[#7B5EA7]'
                            }
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]`}
                            aria-label={isNeutral ? `${text} – gaat direct verder naar volgende stap` : text}
                            aria-pressed={focusedIndex === i}
                        >
                            {icon?.src && (
                                <div
                                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                                    style={{ width: '70px', height: '70px', backgroundColor: '#F0E8FF' }}
                                    aria-hidden="true"
                                >
                                    <img
                                        src={icon.src}
                                        alt=""
                                        className="object-contain"
                                        style={{ width: '50px', height: '50px' }}
                                    />
                                </div>
                            )}
                            <span className="text-base font-semibold text-gray-800">{text}</span>
                            {isNeutral && (
                                <span className="ml-auto text-xs text-gray-400 italic" aria-hidden="true">
                                    direct verder
                                </span>
                            )}
                        </button>
                    );
                })}
            </fieldset>
            <p id={`${namePrefix}-extra-hint`} className="text-xs text-gray-400 text-center">
                Kies een optie, bij de eerste of laatste optie komt er straks een extra vraag.
            </p>
        </div>
    );
}
