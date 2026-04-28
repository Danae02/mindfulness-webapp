import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import SearchBar from "@/Components/SearchBar.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

// Zelfde berekening als backend en Feelingsdashboard
function normalize(value, scale) {
    if (value == null || scale == null || scale <= 1) return null;
    return Math.round(((value - 1) / (scale - 1)) * 100);
}

function formatDuration(sec) {
    if (sec == null || sec === 0) return "–";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

// Kleine score-badge: groen als hoog, oranje als laag
function ScoreBadge({ value }) {
    if (value == null) return <span className="text-gray-400">–</span>;
    const color =
        value >= 66
            ? "bg-green-100 text-green-800"
            : value >= 33
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800";
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
            {value}/100
        </span>
    );
}

export default function PaginatedDataTable({
                                               linkForPagination,
                                               researchGroups = [],  // optioneel: voor groepsfilter
                                               exercises = [],       // optioneel: voor oefening-filter
                                           }) {
    const [dataPoints, setDataPoints] = useState([]); // Bevat de huidige pagina met data
    const [currentPage, setCurrentPage] = useState(1); // Huidige pagina
    const [totalPages, setTotalPages] = useState(0); // Totaal aantal pagina's
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedExercise, setSelectedExercise] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const fetchData = useCallback(
        (page) => {
            setLoading(true);
            const params = { page };
            if (selectedGroup) params.research_group_id = selectedGroup;
            if (selectedExercise) params.exercise_id = selectedExercise;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            axios
                .get(linkForPagination, { params })
                .then((response) => {
                    const data = response.data;
                    setDataPoints(data.data);
                    setCurrentPage(data.current_page);
                    setTotalPages(data.last_page);
                })
                .catch((error) => console.error("Error fetching data:", error))
                .finally(() => setLoading(false));
        },
        [linkForPagination, selectedGroup, selectedExercise, dateFrom, dateTo]
    );

    // Herlaad bij filterwijziging
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedGroup, selectedExercise, dateFrom, dateTo]);

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);

    // zoekterm filter op naam oefening
    const filtered = dataPoints.filter((dp) =>
        dp.exercise?.exercise_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const clearFilters = () => {
        setSelectedGroup("");
        setSelectedExercise("");
        setDateFrom("");
        setDateTo("");
        setSearchTerm("");
    };

    const hasFilters = selectedGroup || selectedExercise || dateFrom || dateTo || searchTerm;

    return (
        <div>
            {/* Filter-balk */}
            <div className="flex flex-wrap gap-3 mb-5 items-end">
                <div>
                    <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} catTerm="oefening" />
                </div>

                {researchGroups.length > 0 && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Onderzoeksgroep</label>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                            <option value="">Alle groepen</option>
                            {researchGroups.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {exercises.length > 0 && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Oefening</label>
                        <select
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                            <option value="">Alle oefeningen</option>
                            {exercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>{ex.exercise_name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Van</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Tot</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>

                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-purple-600 underline self-end pb-2"
                    >
                        Filters wissen
                    </button>
                )}
            </div>

            {loading ? (
                <LoadingIndicator message="Datapunten laden..." />
            ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Geen data gevonden</div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                {[
                                    "Log ID",
                                    "Gebruiker ID",
                                    "Oefening",
                                    "Datum",
                                    "Sessieduur",
                                    "Voltooid",
                                    "Gevoel voor",
                                    "Gevoel na",
                                    "Verschil",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {filtered.map((log) => {
                                // Gebruik opgeslagen _pct velden als beschikbaar, anders normaliseer
                                const before =
                                    log.feeling_before_pct != null
                                        ? log.feeling_before_pct
                                        : normalize(log.feeling_before, log.feeling_scale ?? 5);
                                const after =
                                    log.feeling_after_pct != null
                                        ? log.feeling_after_pct
                                        : normalize(log.feeling_after, log.feeling_scale ?? 5);
                                const diff =
                                    before != null && after != null ? after - before : null;

                                return (
                                    <tr key={log.log_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-400 font-mono">{log.log_id}</td>
                                        <td className="px-4 py-3 text-gray-600">{log.user_id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {log.exercise?.exercise_name ?? "–"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {log.date_time
                                                ? new Date(log.date_time).toLocaleDateString("nl-NL")
                                                : "–"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {formatDuration(log.session_duration)}
                                        </td>
                                        <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        log.completed
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {log.completed ? "Ja" : "Nee"}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <ScoreBadge value={before} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <ScoreBadge value={after} />
                                        </td>
                                        <td className="px-4 py-3 font-semibold"
                                            style={{
                                                color:
                                                    diff == null
                                                        ? "#9ca3af"
                                                        : diff >= 0
                                                            ? "#15803d"
                                                            : "#b91c1c",
                                            }}
                                        >
                                            {diff == null ? "–" : (diff >= 0 ? "+" : "") + diff}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-5">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: "#6C4092", color: "#6C4092" }}
                        >
                            ← Vorige
                        </button>
                        <span className="text-sm text-gray-500">
                            Pagina {currentPage} van {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: "#6C4092", color: "#6C4092" }}
                        >
                            Volgende →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
