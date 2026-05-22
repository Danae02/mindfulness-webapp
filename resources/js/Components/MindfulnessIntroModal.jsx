import { useEffect, useRef } from 'react';

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

export default function MindfulnessIntroModal({ onClose }) {
    const modalRef       = useRef(null);
    const closeButtonRef = useRef(null);

    // Focus trap & ESC — zelfde patroon als ClientCourseModal
    useEffect(() => {
        const previousFocus = modalRef.current?.querySelector('[id="mindfulness-modal-title"]');
        previousFocus?.focus();

        const htmlElement    = document.documentElement;
        const prevAriaHidden = htmlElement.getAttribute('aria-hidden');
        htmlElement.setAttribute('aria-hidden', 'true');

        const focusableSelectors =
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key !== 'Tab') return;

            const focusable = Array.from(
                modalRef.current?.querySelectorAll(focusableSelectors) || []
            );
            const first = focusable[0];
            const last  = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (prevAriaHidden === null) {
                htmlElement.removeAttribute('aria-hidden');
            } else {
                htmlElement.setAttribute('aria-hidden', prevAriaHidden);
            }
        };
    }, [onClose]);

    const handleSave = () => {
        localStorage.setItem('mindfulness-intro-seen', 'true');
        onClose();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mindfulness-modal-title"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto"
                role="document"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header — zelfde opbouw als ClientCourseModal */}
                <div className="flex items-start justify-between p-6 pb-2">
                    <h2
                        id="mindfulness-modal-title"
                        className="text-2xl font-bold"
                        style={{ color: '#6C4092' }}
                        tabIndex={-1}
                    >
                        Introductie mindfulness
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C4092]"
                        style={{ backgroundColor: '#6C4092' }}
                        aria-label="Sluit dialoogvenster"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a3479')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6C4092')}
                    >
                        <span aria-hidden="true">✕</span>
                        Sluiten
                    </button>
                </div>

                {/* Ondertitel */}
                <p className="px-6 pb-3 text-sm text-gray-500 leading-relaxed">
                    Nieuw met mindfulness? Lees dan even de inleiding. Je kunt dit altijd teruglezen via het dashboard.
                </p>

                {/* Chapters */}
                <div className="p-6 pt-2">
                    <div className="space-y-3" role="list" aria-label="Introductie hoofdstukken">
                        {CHAPTERS.map((ch, i) => (
                            <div
                                key={i}
                                role="listitem"
                                className="flex gap-4 p-4 rounded-xl"
                                style={{ backgroundColor: '#F5EFFF', border: '1px solid #E2D5F5' }}
                            >
                                <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">
                                    {ch.icon}
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold mb-1" style={{ color: '#3D2A6E' }}>
                                        {ch.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: '#4B3B6B' }}>
                                        {ch.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bevestigingsknop onderaan */}
                    <button
                        onClick={handleSave}
                        className="mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C4092]"
                        style={{ backgroundColor: '#6C4092' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a3479')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6C4092')}
                    >
                        Begrepen, aan de slag →
                    </button>
                </div>
            </div>
        </div>
    );
}
