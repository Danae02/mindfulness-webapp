import { useRef, useState, useEffect } from "react";

export default function AudioControl({ AudioName = "", label = "Audio afspelen" }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const isSeekingRef = useRef(false);
    const intendedTimeRef = useRef(0);
    const [announcement, setAnnouncement] = useState("");
    const audioTimerRef = useRef(null);

    // tijd naar mm:ss
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    // versie voor screenreader: ".. minuten en ... seconden"
    const formatTimeSpoken = (seconds) => {
        if (isNaN(seconds)) return "0 seconden";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if (mins === 0) return `${secs} seconden`;
        if (secs === 0) return `${mins} minuten`;
        return `${mins} minuten en ${secs} seconden`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (!isSeekingRef.current) {
                intendedTimeRef.current = audio.currentTime;
                setCurrentTime(audio.currentTime);
            }
        };
        const setAudioDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            intendedTimeRef.current = 0;
            setCurrentTime(0);
            setAnnouncement("De oefening is afgelopen.");
            setTimeout(() => {
                setIsPlaying(false);
                setTimeout(() => setAnnouncement(""), 3000);
            }, 150);
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setAudioDuration);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    useEffect(() => {
        return () => clearTimeout(audioTimerRef.current);
    }, []);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isStarting) return;
            if (isPlaying) {
                clearTimeout(audioTimerRef.current);
                audioRef.current.pause();
                setIsPlaying(false);
                setIsStarting(false);
            } else {
                const timeToSeek = intendedTimeRef.current;
                setIsStarting(true);
                setAnnouncement("");
                clearTimeout(audioTimerRef.current);
                audioTimerRef.current = setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.currentTime = timeToSeek;
                        audioRef.current.play();
                        setIsStarting(false);
                        setIsPlaying(true);
                    }
                }, 1500);
            }
        }
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        intendedTimeRef.current = newTime;
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleSeekStart = () => { isSeekingRef.current = true; };
    const handleSeekEnd   = () => {
        isSeekingRef.current = false;
        // Eenmalige aankondiging na seek, alleen huidige positie
        setAnnouncement(`Gezet op ${formatTimeSpoken(intendedTimeRef.current)}.`);
        setTimeout(() => setAnnouncement(""), 2000);
    };

    return (
        <div className="w-full space-y-4">
            <audio
                ref={audioRef}
                src={AudioName}
                preload="auto"
                className="hidden"
            />

            <div
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {announcement}
            </div>

            {/* Tijdsweergave */}
            <div className="flex justify-between text-sm text-gray-600" aria-hidden="true">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            {/* Slider */}
            <div className="space-y-2" aria-hidden="true">
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    onMouseDown={handleSeekStart}
                    onMouseUp={handleSeekEnd}
                    onTouchStart={handleSeekStart}
                    onTouchEnd={handleSeekEnd}
                    tabIndex="-1"
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer accent-[#7B5EA7]
                        focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                    style={{
                        background: `linear-gradient(to right, #7B5EA7 0%, #7B5EA7 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                    }}
                />
                <p className="sr-only">
                    Gebruik de pijltjestoetsen om terug of vooruit te gaan.
                </p>
            </div>

            {/* Play/Pause knop */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={togglePlayPause}
                    aria-label={isStarting ? "Wordt gestart" : (isPlaying ? "Pauzeren" : "Afspelen")}
                    className="flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200
                        hover:shadow-xl
                        focus:outline-none focus:ring-4 focus:ring-[#7B5EA7] focus:ring-offset-2"
                    style={{ backgroundColor: '#7B5EA7', color: 'white' }}
                >
                    {isStarting ? (
                        <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    ) : isPlaying ? (
                        <svg className="w-14 h-14" fill="white" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    ) : (
                        <svg className="w-14 h-14" fill="white" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
