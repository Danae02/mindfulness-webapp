import { useState, useRef, useEffect } from 'react';

export default function AudioButton({ audioFile, label = "Lees voor" }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const audioRef = useRef(null);

    // Initialiseer audio element
    useEffect(() => {
        if (audioFile && !audioRef.current) {
            audioRef.current = new Audio(audioFile);
            audioRef.current.onended = () => {
                setIsPlaying(false);
            };
            audioRef.current.onerror = () => {
                console.error('Audio bestand niet gevonden:', audioFile);
                setAudioError(true);
                setIsPlaying(false);
            };
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [audioFile]);

    const togglePlay = () => {
        if (!audioRef.current) {
            console.error('Audio element niet beschikbaar');
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(error => {
                console.error('Kan audio niet afspelen:', error);
                setAudioError(true);
            });
            setIsPlaying(true);
        }
    };

    // Als er een fout is met het audiobestand
    if (audioError) {
        return (
            <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
                title="Audiobestand niet beschikbaar"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="text-sm font-medium">Audio niet beschikbaar</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={isPlaying ? "Stop met voorlezen" : "Lees tekst voor"}
            title={isPlaying ? "Stop met voorlezen" : "Lees tekst voor"}
        >
            {isPlaying ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            )}
            <span className="text-sm font-medium">
                {isPlaying ? "Stop" : label}
            </span>
        </button>
    );
}
