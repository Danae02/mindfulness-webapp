import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import SearchBar from "@/Components/SearchBar.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

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

function ScoreBadge({ value }) {
    if (value == null) return <span className="text-gray-600">–</span>;
    const color =
        value >= 66
            ? "bg-green-100 text-green-800"
            : value >= 33
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800";
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-black ${color}`}>
            {value}/100
        </span>
    );
}

export default function PaginatedDataTable({
                                               linkForPagination,
                                               researchGroups = [],
                                               exercises = [],
                                               userRole = null,
                                           }) {
    const [dataPoints, setDataPoints] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedExercise, setSelectedExercise] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const statusRef = useRef(null);

    const canDelete = userRole === 1;

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

    // Herlaad bij filterwijziging — altijd vanaf pagina 1
    useEffect(() => {
        setCurrentPage(1);
        fetchData(1);
    }, [selectedGroup, selectedExercise, dateFrom, dateTo]);

    // Herlaad bij paginawissel
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);

    // zoekterm filter op naam oefening en gebruikers ID
    const filtered = dataPoints.filter((dp) => {
        const searchLower = searchTerm.toLowerCase();
        const exerciseName = dp.exercise?.exercise_name?.toLowerCase() || "";
        const userId = String(dp.user_id).toLowerCase();
        return exerciseName.includes(searchLower) || userId.includes(searchLower);
    });

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

    const handleDeleteConfirm = () => {
        axios
            .delete(`${linkForPagination}/${confirmDelete.log_id}`)
            .then(() => {
                setDataPoints((prev) => prev.filter((dp) => dp.log_id !== confirmDelete.log_id));
                setConfirmDelete(null);
                setDeleteError(null);
            })
            .catch(() => setDeleteError("Verwijderen mislukt. Probeer het opnieuw."));
    };

    const columns = [
        "Log ID",
        "Gebruiker ID",
        "Oefening",
        "Datum",
        "Sessieduur",
        "Voltooid",
        "Resultaat voor",
        "Resultaat na",
        "Verschil",
        ...(canDelete ? [""] : []),
    ];

    return (
        <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #5F5F5F', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div
                ref={statusRef}
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {loading
                    ? "Datapunten worden geladen."
                    : `${filtered.length} datapunten gevonden. Pagina ${currentPage} van ${totalPages}.`}
            </div>

            <fieldset className="mb-5 border-0 p-0 m-0">
                <legend className="text-sm font-semibold text-gray-700 mb-2">
                    Filters
                </legend>
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearch={setSearchTerm}
                            catTerm="oefening of gebruikers ID"
                        />
                    </div>

                    {researchGroups.length > 0 && (
                        <div>
                            <label
                                htmlFor="filter-group"
                                className="block text-xs text-gray-600 mb-1"
                            >
                                Onderzoeksgroep
                            </label>
                            <select
                                id="filter-group"
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="">Alle groepen</option>
                                {researchGroups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {exercises.length > 0 && (
                        <div>
                            <label
                                htmlFor="filter-exercise"
                                className="block text-xs text-gray-600 mb-1"
                            >
                                Oefening
                            </label>
                            <select
                                id="filter-exercise"
                                value={selectedExercise}
                                onChange={(e) => setSelectedExercise(e.target.value)}
                                className="border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="">Alle oefeningen</option>
                                {exercises.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.exercise_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="filter-date-from" className="block text-xs text-gray-600 mb-1">
                            Van
                        </label>
                        <input
                            id="filter-date-from"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="filter-date-to" className="block text-xs text-gray-600 mb-1">
                            Tot
                        </label>
                        <input
                            id="filter-date-to"
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                            style={{
                                backgroundColor: "#f0f0f0",
                                color: "#666",
                            }}
                        >
                            Filters wissen
                        </button>
                    )}
                </div>
            </fieldset>

            {loading ? (
                <LoadingIndicator message="Datapunten laden..." />
            ) : (
                <>
                    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Datapunten tabel">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                            <tr className="border-b-2 border-gray-900 bg-gray-200">
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className="px-4 py-3 text-left font-semibold text-gray-900"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-6 text-center text-gray-500 italic"
                                    >
                                        Geen datapunten gevonden.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((log) => {
                                    const before = normalize(log.feeling_before, log.feeling_scale);
                                    const after = normalize(log.feeling_after, log.feeling_scale);
                                    const diff = before !== null && after !== null ? after - before : null;
                                    const diffLabel = diff === null ? "geen data" : `${diff >= 0 ? "+" : ""}${diff}`;

                                    return (
                                        <tr key={log.log_id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-gray-700">
                                                #{log.log_id}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {log.user_id}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {log.exercise?.exercise_name ?? "–"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {log.date_time
                                                    ? new Date(log.date_time).toLocaleDateString("nl-NL")
                                                    : "–"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                {formatDuration(log.session_duration)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-black ${
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
                                            <td
                                                className="px-4 py-3 font-semibold"
                                                aria-label={diffLabel}
                                                style={{
                                                    color:
                                                        diff == null
                                                            ? "#4b5563"
                                                            : diff >= 0
                                                                ? "#15803d"
                                                                : "#b91c1c",
                                                }}
                                            >
                                                {diff == null
                                                    ? "–"
                                                    : (diff >= 0 ? "+" : "") + diff}
                                            </td>
                                            {canDelete && (
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() =>
                                                            setConfirmDelete({
                                                                log_id: log.log_id,
                                                                exercise_name:
                                                                    log.exercise?.exercise_name ?? `#${log.log_id}`,
                                                            })
                                                        }
                                                        className="text-xs font-medium underline"
                                                        style={{ color: "#A5271A" }}
                                                        aria-label={`Verwijder log ${log.log_id}`}
                                                    >
                                                        Verwijderen
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-5">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Vorige pagina"
                            className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: "#6C4092", color: "#6C4092" }}
                        >
                            <span aria-hidden="true">← </span>Vorige
                        </button>

                        <span
                            className="text-sm text-gray-700"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            Pagina {currentPage} van {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Volgende pagina"
                            className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: "#6C4092", color: "#6C4092" }}
                        >
                            Volgende<span aria-hidden="true"> →</span>
                        </button>
                    </div>
                </>
            )}

            {confirmDelete && canDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                >
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
                        <h2
                            id="confirm-title"
                            className="text-lg font-bold text-gray-900 mb-2"
                        >
                            Datapunt verwijderen
                        </h2>
                        <p className="text-sm text-gray-700 mb-1">
                            Weet je zeker dat je log{" "}
                            <span className="font-semibold">#{confirmDelete.log_id}</span>{" "}
                            (<span className="italic">{confirmDelete.exercise_name}</span>) wilt
                            verwijderen?
                        </p>
                        <p className="text-sm font-medium mb-5 flex items-center gap-2" style={{ color: "#A5271A" }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                className="w-4 h-4 shrink-0"
                            >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Dit verwijdert het datapunt definitief uit de database.
                        </p>
                        {deleteError && (
                            <p className="text-xs font-medium mb-3" style={{ color: "#A5271A" }}>{deleteError}</p>
                        )}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setConfirmDelete(null);
                                    setDeleteError(null);
                                }}
                                className="px-4 py-2 rounded-lg text-sm border-2 border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                                style={{ backgroundColor: "#A5271A" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#8B1F15"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#A5271A"}
                            >
                                Ja, verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
