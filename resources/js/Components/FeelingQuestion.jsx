import { useState } from 'react';
import AnswerOption from './AnswerOption';

export default function FeelingQuestion({ question, answers, namePrefix, onConfirm }) {
    const isTwoStep = answers.length === 5;

    // Stap 1: "Slecht" | "Neutraal" | "Goed"
    const [globalChoice, setGlobalChoice] = useState(null);
    // Stap 2: verfijning
    const [refinedIndex, setRefinedIndex] = useState(null);

    // Enkelvoudige modus (3-4 opties)
    const [singleIndex, setSingleIndex] = useState(null);

    // Stap 1: kies globaal
    const handleGlobalChoice = (choice, directIndex) => {
        if (choice === 'neutral') {
            // Neutraal = index 2 (1-based: 3) → direct bevestigen
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
        onConfirm(refinedIndex + 1); // 1-based waarde
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
    };

    // enkelvoudige modus
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

    // twee-stappen modus
    // verfijning
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

    // globale keuze
    const globalOptions = [
        { answer: answers[0], choice: 'bad', directIndex: null },
        { answer: answers[2], choice: 'neutral', directIndex: 2 },
        { answer: answers[4], choice: 'good', directIndex: null },
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
