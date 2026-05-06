import { useState, useRef } from "react";
import axios from "axios";

export default function BackupManager() {
    const [isDownloading, setIsDownloading]   = useState(false);
    const [isRestoring, setIsRestoring]       = useState(false);
    const [downloadError, setDownloadError]   = useState(null);
    const [restoreResult, setRestoreResult]   = useState(null);
    const [restoreError, setRestoreError]     = useState(null);
    const [selectedFile, setSelectedFile]     = useState(null);
    const [dragOver, setDragOver]             = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const fileInputRef                        = useRef(null);

    //Download backup
    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadError(null);
        try {
            const response = await axios.get(route("admin.backup.download"), {
                responseType: "blob",
            });

            const url      = window.URL.createObjectURL(new Blob([response.data]));
            const link     = document.createElement("a");
            const filename = `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.zip`;
            link.href      = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            const msg = error.response?.data?.message ?? "Er is een fout opgetreden bij het downloaden van de backup.";
            setDownloadError(msg);
        } finally {
            setIsDownloading(false);
        }
    };

    // Bestand selecteren
    const handleFileSelect = (file) => {
        if (!file) return;
        if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
            setRestoreError("Alleen ZIP-bestanden worden geaccepteerd.");
            return;
        }
        setSelectedFile(file);
        setRestoreError(null);
        setRestoreResult(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    // Restore backup
    const handleRestore = async () => {
        if (!selectedFile) return;
        setConfirmVisible(true);
    };

    const handleConfirmRestore = async () => {
        setConfirmVisible(false);
        setIsRestoring(true);
        setRestoreResult(null);
        setRestoreError(null);

        const formData = new FormData();
        formData.append("backup", selectedFile);

        try {
            const response = await axios.post(route("admin.backup.restore"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setRestoreResult(response.data);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            const msg = error.response?.data?.message ?? "Onbekende fout bij terugzetten.";
            setRestoreError(msg);
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* backup downloaden  */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div>
                        <h4 className="font-semibold text-gray-800">Backup downloaden</h4>
                        <p className="text-sm text-gray-500">
                            Download een ZIP-bestand met alle cursussen, oefeningen en audiobestanden.
                        </p>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-600 mb-4">
                        De backup bevat:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-5 list-none">
                        {[
                            "metadata.json: alle cursussen, oefeningen, vragen en antwoorden",
                            "audio/: alle MP3-bestanden",
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#6C4092" }}
                    >
                        {isDownloading ? (
                            <>
                                <Spinner />
                                Bezig met ZIP-bestand maken…
                            </>
                        ) : (
                            <>
                                <DownloadIcon />
                                Backup downloaden
                            </>
                        )}
                    </button>

                    {downloadError && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <span className="mt-0.5">⚠️</span>
                            <span>{downloadError}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* backup herstellen/terugzetten */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div>
                        <h4 className="font-semibold text-gray-800">Backup terugzetten</h4>
                        <p className="text-sm text-gray-500">
                            Upload een eerder gedownloade backup-ZIP-bestand om alles terug te zetten.
                        </p>
                    </div>
                </div>
                <div className="px-6 py-5 space-y-4">

                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                            dragOver
                                ? "border-purple-400 bg-purple-50"
                                : selectedFile
                                    ? "border-green-400 bg-green-50"
                                    : "border-gray-300 hover:border-purple-300 hover:bg-gray-50"
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".zip"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                        />
                        {selectedFile ? (
                            <div className="space-y-1">
                                <p className="text-2xl">✅</p>
                                <p className="font-medium text-green-700">{selectedFile.name}</p>
                                <p className="text-sm text-green-600">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB, klaar om te uploaden
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-3xl">📂</p>
                                <p className="font-medium text-gray-600">
                                    Sleep je backup-ZIP-bestand hier naartoe
                                </p>
                                <p className="text-sm text-gray-400">of klik om een bestand te kiezen</p>
                            </div>
                        )}
                    </div>

                    {/* Foutmelding */}
                    {restoreError && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <span className="mt-0.5">⚠️</span>
                            <span>{restoreError}</span>
                        </div>
                    )}

                    {/* Succesmelding */}
                    {restoreResult && (
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-sm space-y-1">
                            <p className="font-semibold text-green-800">✅ {restoreResult.message}</p>
                            <p className="text-green-700">
                                Cursussen hersteld: <strong>{restoreResult.restored_courses}</strong>
                            </p>
                            <p className="text-green-700">
                                Oefeningen hersteld: <strong>{restoreResult.restored_exercises}</strong>
                            </p>
                            <p className="text-green-700">
                                Audiobestanden hersteld: <strong>{restoreResult.restored_audio}</strong>
                            </p>
                        </div>
                    )}

                    {/* bevestiging */}
                    {confirmVisible && (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-sm space-y-3">
                            <p className="font-semibold text-amber-800">⚠️ Weet je het zeker?</p>
                            <p className="text-amber-700">
                                Bestaande cursussen worden bijgewerkt, ontbrekende worden opnieuw aangemaakt. Gebruikersdata blijft bewaard.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleConfirmRestore}
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                                >
                                    Ja, terugzetten
                                </button>
                                <button
                                    onClick={() => setConfirmVisible(false)}
                                    className="px-4 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
                                >
                                    Annuleren
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Herstelknop */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRestore}
                            disabled={!selectedFile || isRestoring}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                        >
                            {isRestoring ? (
                                <>
                                    <Spinner />
                                    Bezig met terugzetten…
                                </>
                            ) : (
                                <>
                                    <RestoreIcon />
                                    Backup terugzetten
                                </>
                            )}
                        </button>
                        {selectedFile && !isRestoring && (
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setRestoreError(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Annuleren
                            </button>
                        )}
                    </div>

                    {/* Waarschuwing */}
                    <p className="text-xs text-gray-400">
                        ℹ️ Gebruikersdata wordt <strong>niet</strong> overschreven.
                        Ontbrekende cursussen en oefeningen worden opnieuw aangemaakt.
                    </p>
                </div>
            </section>
        </div>
    );
}

// hulpcomponenten

// draaiende laad-icoon
function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
    );
}

// pijl omlaag icoon
function DownloadIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 3v12" />
        </svg>
    );
}

// cirkel terugdraai icoon
function RestoreIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 15A9 9 0 1018.364 8.636" />
        </svg>
    );
}
