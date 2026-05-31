import { useState } from 'react';

const CHAPTERS = [
    {
        title: 'Wat is mindfulness?',
        body: 'Mindfulness betekent bewust aandacht geven aan het huidige moment zonder oordeel. Het helpt bij stress, angst en emotionele uitdagingen. En het werkt voor iedereen: de oefeningen zijn speciaal ontworpen zodat mensen met visuele of verstandelijke beperkingen ze ook kunnen volgen. Ze zijn kort, duidelijk ingesproken en in begrijpelijke taal.',
    },
    {
        title: 'Waarom helpt het?',
        body: 'Uit vele onderzoeken blijkt dat mindfulness positieve effecten heeft op klachten als pijn, stress, angst en depressie. Mindfulness beoefenen helpt om te leren omgaan met stress. Dit geldt zeker ook voor mensen met een (visuele) verstandelijke beperking. ',
    },
    {
        title: 'Jouw rol als begeleider',
        body: 'Je begeleidt je cliënt door er voor hen te zijn: aanmoedigen, meekijken, en vragen hoe het gaat. Elke dag kan een nieuwe oefening worden gedaan. Jij helpt, de app leidt zelf.',
    },
    {
        title: 'Tip',
        body: 'De oefeningen kunnen op elk moment van de dag beluisterd worden en mogen ook herhaald worden net zolang als het past voor jouw cliënt of familielid. Na de oefening kan deze aangeklikt worden als favoriet. Op die manier kan aan het eind een eigen programma van favoriete oefeningen ontstaan.',
    },
];

export default function MindfulnessInfoBlock() {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="mb-6 rounded-2xl overflow-hidden"
            style={{ border: '1.5px solid #000000', backgroundColor: '#FDFBFF' }}
        >
            {/* Toggle header */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mindfulness-info-content"
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7B5EA7]"
                style={{ backgroundColor: open ? '#EDE5F8' : '#F5EFFF' }}
                onMouseEnter={(e) => !open && (e.currentTarget.style.backgroundColor = '#EDE5F8')}
                onMouseLeave={(e) => !open && (e.currentTarget.style.backgroundColor = '#F5EFFF')}
            >
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-sm font-bold" style={{ color: '#3D2A6E' }}>
                            Introductie: wat is mindfulness?
                        </p>
                        <p className="text-xs" style={{ color: '#7B5EA7' }}>
                            {open ? 'Klik om te sluiten' : 'Nieuw bij mindfulness? Lees hier de inleiding.'}
                        </p>
                    </div>
                </div>
                <svg
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                    style={{
                        color: '#7B5EA7',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expandable content */}
            {open && (
                <div
                    id="mindfulness-info-content"
                    className="px-5 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                    {CHAPTERS.map((ch, i) => (
                        <div
                            key={i}
                            className="flex gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: '#F0E8FF', border: '1px solid #000000' }}
                        >
                            <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{ch.icon}</span>
                            <div>
                                <h3 className="text-xs font-bold mb-1" style={{ color: '#3D2A6E' }}>
                                    {ch.title}
                                </h3>
                                <p className="text-xs leading-relaxed" style={{ color: '#4B3B6B' }}>
                                    {ch.body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
