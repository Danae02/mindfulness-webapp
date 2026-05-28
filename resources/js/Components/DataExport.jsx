import { useState, useId, useRef, useCallback } from "react";
import axios from "axios";

// Maak een gevoelswaarde 0–100.
// Formule: (waarde - 1) / (schaal - 1) * 100
// Zo zijn 3-schaal en 5-schaal vergelijkbaar te berekenen:
//   waarde 1 op 5-schaal → 0%
//   waarde 5 op 5-schaal → 100%
//   waarde 1 op 3-schaal → 0%
//   waarde 3 op 3-schaal → 100%
function normalizeFeeling(value, scale = 5) {
    if (value == null || scale <= 1) return null;
    return Math.round((value - 1) / (scale - 1) * 100);
}

// 1.3.1
const COLUMN_LABELS = {
    log_id:                "Log ID",
    user_id:               "Gebruiker ID",
    exercise:              "Oefening",
    date_time:             "Datum en tijd",
    duration_listened_sec: "Duur (sec)",
    completed:             "Voltooid",
    feeling_before:        "Resultaat voor",
    feeling_after:         "Resultaat na",
    feeling_scale:         "Schaal",
    feeling_before_pct:    "Resultaat voor (%)",
    feeling_after_pct:     "resultaat na (%)",
};

export default function DataExport({ researchGroups = [], exercises = [] }) {
    const [selectedGroup, setSelectedGroup]       = useState("");
    const [selectedExercise, setSelectedExercise] = useState("");
    const [dateFrom, setDateFrom]                 = useState("2025-01-01");
    const [dateTo, setDateTo]                     = useState(new Date().toISOString().slice(0, 10));
    const [format, setFormat]                     = useState("csv");
    const [loading, setLoading]                   = useState(false);
    const [error, setError]                       = useState(null);
    const [preview, setPreview]                   = useState(null);
    const [statusMessage, setStatusMessage]       = useState("");

    const formatGroupId = useId();
    const statusId      = useId();

    // Refs voor roving tabindex in de radiogroup (2.1.1)
    const radioRefs = useRef([]);
    const formatOptions = [
        {
            value: "csv",
            label: "CSV",
            svg: (
                <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="5" fill="#1D6F42"/>
                    <rect x="5" y="8" width="22" height="16" rx="1" fill="white" fillOpacity="0.12"/>
                    <line x1="5" y1="13" x2="27" y2="13" stroke="white" strokeOpacity="0.4" strokeWidth="1"/>
                    <line x1="5" y1="18" x2="27" y2="18" stroke="white" strokeOpacity="0.4" strokeWidth="1"/>
                    <line x1="12" y1="8" x2="12" y2="24" stroke="white" strokeOpacity="0.4" strokeWidth="1"/>
                    <line x1="19" y1="8" x2="19" y2="24" stroke="white" strokeOpacity="0.4" strokeWidth="1"/>
                    <text x="16" y="20.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">CSV</text>
                </svg>
            ),
        },
        {
            value: "json",
            label: "JSON",
            svg: (
                <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="5" fill="#5B3F8A"/>
                    <text x="16" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white" fontFamily="monospace">{"{}"}</text>
                    <text x="16" y="24" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">JSON</text>
                </svg>
            ),
        },
    ];

    const handleRadioKeyDown = useCallback((e, currentIndex) => {
        const count = formatOptions.length;
        let next = currentIndex;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            next = (currentIndex + 1) % count;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            next = (currentIndex - 1 + count) % count;
        } else {
            return;
        }

        setFormat(formatOptions[next].value);
        radioRefs.current[next]?.focus();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setStatusMessage("Data wordt opgehaald…");
        try {
            const params = {};
            if (selectedGroup)    params.research_group_id = selectedGroup;
            if (selectedExercise) params.exercise_id       = selectedExercise;
            if (dateFrom)         params.date_from         = dateFrom;
            if (dateTo)           params.date_to           = dateTo;

            const res = await axios.get("/logs/export", { params });
            setStatusMessage("");
            return res.data;
        } catch (e) {
            setError("Er is iets misgegaan bij het ophalen van de data. Probeer het opnieuw.");
            setStatusMessage("");
            return null;
        } finally {
            setLoading(false);
        }
    };


    // Elke rij heeft orginele waarden
    const buildRows = (data) =>
        data.map((log) => ({
            log_id:                log.log_id,
            user_id:               log.user_id,
            exercise:              log.exercise?.exercise_name ?? "-",
            date_time:             log.date_time,
            duration_listened_sec: log.session_duration,
            completed:             log.completed ? "Ja" : "Nee",
            feeling_before:        log.feeling_before ?? "-",
            feeling_after:         log.feeling_after  ?? "-",
            feeling_scale:         log.feeling_scale  ?? 5,

            // Genormaliseerd naar 0–100 zodat 3-schaal en 5-schaal vergelijkbaar zijn
            feeling_before_pct:    normalizeFeeling(log.feeling_before, log.feeling_scale ?? 5) ?? "-",
            feeling_after_pct:     normalizeFeeling(log.feeling_after,  log.feeling_scale ?? 5) ?? "-",
        }));

    const exportCSV = (rows) => {
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const lines = [
            "sep=;",
            headers.map((h) => COLUMN_LABELS[h] ?? h).join(";"),
            ...rows.map((r) =>
                headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(";")
            ),
        ];
        const bom = "\uFEFF";
        triggerDownload(bom + lines.join("\n"), "export.csv", "text/csv;charset=utf-8;");
    };

    const exportJSON = (rows) => {
        triggerDownload(JSON.stringify(rows, null, 2), "export.json", "application/json");
    };

    // bestandsdownload triggeren via een tijdelijke <a>-tag
    const triggerDownload = (content, filename, mime) => {
        const blob = new Blob([content], { type: mime });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownload = async () => {
        const data = await fetchData();
        if (!data) return;

        // eerste 5 rijen opslaan voor preview tabel
        const rows = buildRows(data);
        setPreview(rows.slice(0, 5));
        if (rows.length === 0) {
            setStatusMessage("Geen data gevonden voor de geselecteerde filters.");
            return;
        }
        setStatusMessage(`${rows.length} rijen geëxporteerd als ${format.toUpperCase()}.`);
        format === "csv" ? exportCSV(rows) : exportJSON(rows);
    };

    const inputClass =
        "w-full border-2 border-gray-500 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2872]";

    return (
        <div className="max-w-3xl bg-white rounded-xl p-6" style={{ border: "1px solid #5F5F5F", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }}>
            {/* Schermlezer live-regio voor statusmeldingen */}
            <div id={statusId} aria-live="polite" aria-atomic="true" className="sr-only">
                {statusMessage}
            </div>

            <p className="text-sm text-gray-700 mb-6">
                Stel in welke gegevens je wilt exporteren. Alle data is anoniem.
            </p>

            {/* Filters — fieldset+legend voor semantische groepering  */}
            <fieldset className="border-2 border-gray-500 rounded-xl p-5 mb-6">
                <legend className="text-sm font-semibold text-gray-900 px-2">Filters</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                        <label htmlFor="export-group" className="block text-xs font-semibold text-gray-800 mb-1">
                            Onderzoeksgroep
                        </label>
                        {/* Geen dubbele aria-label: htmlFor/id koppeling is voldoende (WCAG 4.1.2) */}
                        <select id="export-group" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className={inputClass}>
                            <option value="">Alle groepen</option>
                            {researchGroups.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="export-exercise" className="block text-xs font-semibold text-gray-800 mb-1">
                            Oefening
                        </label>
                        <select id="export-exercise" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} className={inputClass}>
                            <option value="">Alle oefeningen</option>
                            {exercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>{ex.exercise_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="export-date-from" className="block text-xs font-semibold text-gray-800 mb-1">
                            Periode van
                        </label>
                        <input id="export-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass}/>
                    </div>

                    <div>
                        <label htmlFor="export-date-to" className="block text-xs font-semibold text-gray-800 mb-1">
                            Periode tot
                        </label>
                        <input id="export-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass}/>
                    </div>
                </div>
            </fieldset>

            {/* Bestandsformaat — radiogroup met roving tabindex (2.1.1) */}
            <div className="mb-6">
                <p id={formatGroupId} className="text-sm font-semibold text-gray-900 mb-3">
                    Bestandsformaat
                </p>
                <div
                    role="radiogroup"
                    aria-labelledby={formatGroupId}
                    className="flex gap-4"
                >
                    {formatOptions.map(({ value, label, svg }, index) => (
                        <button
                            key={value}
                            ref={(el) => (radioRefs.current[index] = el)}
                            type="button"
                            role="radio"
                            aria-checked={format === value}
                            tabIndex={format === value ? 0 : -1}
                            onClick={() => setFormat(value)}
                            onKeyDown={(e) => handleRadioKeyDown(e, index)}
                            className={[
                                "flex items-center gap-3 px-6 py-4 rounded-xl border-2 font-medium text-sm",
                                "transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2872]",
                                format === value
                                    ? "border-[#4A2872] bg-purple-50 text-[#4A2872]"
                                    : "border-gray-500 text-gray-800 hover:border-gray-700 hover:text-gray-900",
                            ].join(" ")}
                        >
                            {svg}
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Foutmelding */}
            {error && (
                <div
                    role="alert"
                    className="mb-4 px-4 py-3 bg-red-50 border-2 border-red-700 text-red-900 rounded-lg text-sm font-medium"
                >
                    <span className="font-bold">Fout: </span>{error}
                </div>
            )}

            {/* Download knop */}
            <button
                type="button"
                onClick={handleDownload}
                disabled={loading}
                aria-disabled={loading}
                aria-describedby={statusId}
                className={[
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm",
                    "transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2872]",
                    loading ? "opacity-60 cursor-not-allowed" : "hover:brightness-110",
                ].join(" ")}
                style={{ backgroundColor: "#4A2872" }}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Bezig met laden…
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Download
                    </>
                )}
            </button>

            {/* Lege staat */}
            {preview && preview.length === 0 && (
                <div
                    role="status"
                    className="mt-6 px-4 py-3 bg-yellow-50 border-2 border-yellow-700 text-yellow-900 rounded-lg text-sm font-medium"
                >
                    Geen data gevonden voor de geselecteerde filters.
                </div>
            )}

            {/* Preview tabel */}
            {preview && preview.length > 0 && (
                <div className="mt-8">
                    <p className="text-xs text-gray-700 font-medium mb-2" aria-hidden="true">
                        Voorbeeld — eerste {preview.length} rijen van de export:
                    </p>
                    <div className="overflow-x-auto rounded-xl border-2 border-gray-500 shadow-sm text-xs">
                        <table className="min-w-full divide-y divide-gray-400">
                            <caption className="sr-only">
                                Exportvoorbeeld: eerste {preview.length} rijen van de geselecteerde data
                            </caption>
                            <thead className="bg-gray-100">
                            <tr>
                                {Object.keys(preview[0]).map((k) => (
                                    <th
                                        key={k}
                                        scope="col"
                                        className="px-4 py-2 text-left font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {COLUMN_LABELS[k] ?? k}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-400">
                            {preview.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} className="px-4 py-2 text-gray-900 whitespace-nowrap">
                                            {String(val)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
