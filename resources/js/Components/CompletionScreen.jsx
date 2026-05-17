import AudioButton from './AudioButton';
import CheckIcon from '@/Icons/CheckIcon';

export default function CompletionScreen({ userName, onBack }) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white px-8 py-6 rounded-lg" style={{ backgroundColor: '#7B5EA7' }}>
                    Oefening klaar!
                </h1>
            </div>

            <div
                className="flex flex-col items-center text-center px-6 pt-8 pb-6 rounded-xl"
                style={{ backgroundColor: '#E8F5E9', border: '2px solid #2E7D32' }}
            >
                {/* Vinkje */}
                <CheckIcon
                    size="medium"
                    color="#FFFFFF"
                    bgColor="#2E7D32"
                    className="mb-4"
                />

                {/* Lees voor knop */}
                <div className="mb-4">
                    <AudioButton
                        hidden={true}
                        audioFile="/audio/ElevenLabs_goedgedaanwoordje.mp3"
                        label="Lees voor"
                        aria-label="Lees de felicitatieboodschap voor"
                    />
                </div>

                {/* Titel */}
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#2E7D32' }}>
                    Goed gedaan, {userName}!
                </h2>

                {/* Beschrijving */}
                <p className="text-base text-gray-700 leading-relaxed max-w-xs">
                    Je hebt de oefening voltooid. Kom morgen terug voor de volgende oefening of herhaal oude oefeningen.
                </p>
            </div>

            {/* Terug knop */}
            <div className="pt-4">
                <button
                    onClick={onBack}
                    className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                    aria-label="Terug naar mijn oefeningen, je verlaat deze oefening"
                >
                    ← Terug naar mijn oefeningen
                </button>
            </div>
        </div>
    );
}
