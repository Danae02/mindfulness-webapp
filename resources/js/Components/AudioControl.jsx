import { useRef, useState, useEffect } from "react";

export default function AudioControl({ AudioName = "", label = "Audio afspelen" }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    // tijd naar mm:ss
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Update progress tijdens afspelen
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const setAudioDuration = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            setProgress(0);
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

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;
        const newTime = percentage * duration;

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            setProgress(percentage * 100);
        }
    };

    return (
        <div className="w-full">
            <audio
                ref={audioRef}
                src={AudioName}
                preload="metadata"
                className="hidden"
            />

            {/* Progress balk */}
            <div className="space-y-3">
                {/* Tijdsweergave */}
                <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                <div
                    className="relative h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute h-full rounded-full transition-all duration-100"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: '#7B5EA7'
                        }}
                    />
                </div>

                {/* Play/Pause knop*/}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={togglePlayPause}
                        aria-label={isPlaying ? "Pauzeren" : "Afspelen"}
                        className="flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#7B5EA7] focus:ring-offset-2"
                        style={{
                            backgroundColor: '#7B5EA7',
                            color: 'white'
                        }}
                    >
                        {isPlaying ? (
                            <svg className="w-14 h-14" fill="white" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        ) : (
                            <svg className="w-14 h-14" fill="white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
