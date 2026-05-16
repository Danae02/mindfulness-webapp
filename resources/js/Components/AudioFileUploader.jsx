import { useRef, useState } from "react";
import axios from "axios";

export default function AudioFileUploader({
                                              chapterNumber,
                                              courseId,
                                              chapter,
                                              onChapterUpdate,
                                              onUploaded,
                                          }) {
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded]   = useState(false);
    const [dragOver, setDragOver]   = useState(false);
    const fileInputRef              = useRef(null);

    const handleFileChange = (file) => {
        if (file) {
            onChapterUpdate({ ...chapter, file });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!chapter.file || !chapter.chapterName) {
            alert(`Vul alle velden in voor oefening ${chapterNumber}.`);
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("audio", chapter.file);
            formData.append("course_id", courseId);
            formData.append("exercise_name", chapter.chapterName);

            await axios.post(route("exercises.create"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setUploaded(true);
            onUploaded?.();
        } catch (error) {
            console.error("Upload failed:", error);
            alert(`Fout bij uploaden van oefening ${chapterNumber}.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className="rounded-xl border-2 p-5 transition-all"
            style={{
                borderColor: uploaded ? "#16A34A" : "#6B7280",
                backgroundColor: uploaded ? "#F0FDF4" : "#FAFAFA",
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                        backgroundColor: uploaded ? "#16A34A" : "#6C4092",
                        color: "#fff",
                    }}
                >
                    {uploaded ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : chapterNumber}
                </div>
                <h3 className="text-base font-semibold text-gray-800">
                    Oefening {chapterNumber}
                </h3>
                {uploaded && (
                    <span className="ml-auto text-xs font-medium text-white bg-green-600 px-2 py-0.5 rounded-full">
                        Geüpload!
                    </span>
                )}
            </div>

            {uploaded ? (
                <p className="text-sm text-green-700 font-medium">{chapter.chapterName}</p>
            ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                    {/* Naam van de oefening */}
                    <div>
                        <label
                            htmlFor={`chapter-name-${chapterNumber}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Naam van de oefening <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            id={`chapter-name-${chapterNumber}`}
                            value={chapter.chapterName}
                            onChange={(e) => onChapterUpdate({ ...chapter, chapterName: e.target.value })}
                            placeholder="Bijvoorbeeld: Ademhalingsoefening"
                            className="w-full px-3 py-2.5 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors bg-white text-gray-900"
                        />
                    </div>

                    {/* Audiobestand */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Audiobestand <span className="text-red-600">*</span>
                        </label>
                        <div
                            className="relative rounded-lg border-2 border-dashed transition-all cursor-pointer"
                            style={{
                                borderColor: dragOver ? "#6C4092" : chapter.file ? "#16A34A" : "#6B7280",
                                backgroundColor: dragOver ? "#F3EEFF" : chapter.file ? "#F0FDF4" : "#FFFFFF",
                            }}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="py-5 px-4 text-center">
                                {chapter.file ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-800 truncate max-w-xs">
                                            {chapter.file.name}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium" style={{ color: "#6C4092" }}>
                                            Klik om een bestand te kiezen
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">MP3, M4A, of WAV</p>
                                    </>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                id={`audio-chapter-${chapterNumber}`}
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60"
                        style={{ backgroundColor: uploading ? "#9CA3AF" : "#6C4092", color: "#fff" }}
                    >
                        {uploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Uploaden...
                            </span>
                        ) : `Oefening ${chapterNumber} uploaden`}
                    </button>
                </form>
            )}
        </div>
    );
}
