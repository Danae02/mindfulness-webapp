import { useRef, useState } from "react";

export default function AudioControl({ AudioName = "", label = "Audio afspelen" }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    console.log(AudioName)

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex flex-col items-center bg-lightGray rounded-xl p-6 shadow-card space-y-4">
            {/* Verborgen label voor schermlezers */}
            <p className="sr-only">{label}</p>
            {/* Audio-element */}
            <audio
                ref={audioRef}
                className="hidden"
                onEnded={() => setIsPlaying(false)} // Reset naar pauze na afloop
            >
                <source src={AudioName} type="audio/mpeg" />
                Je browser ondersteunt het audio-element niet.
            </audio>

            {/* Play/Pause-knop */}
            <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pauzeren" : "Afspelen"}
                className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark focus:ring focus:ring-primary-light focus:outline-none transition-all"
            >
                {isPlaying ? (
                    <span className="text-2xl">⏸️</span> // Pauze-icoon
                ) : (
                    <span className="text-2xl">▶️</span> // Afspelen-icoon
                )}
            </button>
        </div>
    );
}
