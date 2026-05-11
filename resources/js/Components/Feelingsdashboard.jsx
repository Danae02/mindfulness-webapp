import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";


// zelfde formule als backend en ExercisePage
function normalize(value, scale) {
    if (value == null || scale == null || scale <= 1) return null;
    return Math.round(((value - 1) / (scale - 1)) * 100);
}

// Groepeer logs per weeknummer en bereken gemiddelden
function groupByWeek(logs) {
    const weeks = {};
    logs.forEach((log) => {
        if (!log.date_time) return;
        const date = new Date(log.date_time);
        // maandag is start van de week
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNum =
            Math.ceil(
                ((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
            );
        const key = `Week ${weekNum}`;

        if (!weeks[key]) {
            weeks[key] = { week: key, beforeSum: 0, afterSum: 0, count: 0, order: weekNum };
        }

        // Gebruik _pct velden als die er zijn (opgeslagen genormaliseerd), anders bereken zelf via feeling_scale
        const before =
            log.feeling_before_pct != null
                ? log.feeling_before_pct
                : normalize(log.feeling_before, log.feeling_scale ?? 5);
        const after =
            log.feeling_after_pct != null
                ? log.feeling_after_pct
                : normalize(log.feeling_after, log.feeling_scale ?? 5);

        if (before != null && after != null) {
            weeks[key].beforeSum += before;
            weeks[key].afterSum += after;
            weeks[key].count += 1;
        }
    });

    return Object.values(weeks)
        .sort((a, b) => a.order - b.order)
        .map((w) => ({
            week: w.week,
            voor: w.count > 0 ? Math.round(w.beforeSum / w.count) : null,
            na: w.count > 0 ? Math.round(w.afterSum / w.count) : null,
        }));
}

function StatCard({ label, value, sub }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 min-w-[120px]">
            <p className="text-xs text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value ?? "–"}</p>
            {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
        </div>
    );
}

// voor de grafiek
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-purple-100 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: <strong>{p.value}</strong>/100
                </p>
            ))}
        </div>
    );
}

export default function Feelingsdashboard({ researchGroups = [], exercises = [] }) {
    const [activeTab, setActiveTab] = useState("algemeen"); // 'algemeen' | groep-id als string
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [selectedExercise, setSelectedExercise] = useState(""); // "" = alle
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Haal logs op wanneer tab of filters wijzigen
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (selectedExercise) params.exercise_id = selectedExercise;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (activeTab !== "algemeen") params.research_group_id = activeTab;

            const res = await axios.get(route("exercise-logs.export"), { params });
            setLogs(res.data);
        } catch (e) {
            console.error(e);
            setError("Kon data niet laden. Controleer de verbinding.");
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedExercise, dateFrom, dateTo]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Berekende statistieken
    const logsWithBothFeelings = logs.filter(
        (l) => l.feeling_before != null && l.feeling_after != null
    );

    const activeClients = new Set(logs.map((l) => l.user_id)).size;
    const totalMeasurements = logsWithBothFeelings.length;

    const avgBefore =
        logsWithBothFeelings.length > 0
            ? (
                logsWithBothFeelings.reduce((sum, l) => {
                    const v =
                        l.feeling_before_pct != null
                            ? l.feeling_before_pct
                            : normalize(l.feeling_before, l.feeling_scale ?? 5);
                    return sum + (v ?? 0);
                }, 0) / logsWithBothFeelings.length
            ).toFixed(1)
            : null;

    const avgAfter =
        logsWithBothFeelings.length > 0
            ? (
                logsWithBothFeelings.reduce((sum, l) => {
                    const v =
                        l.feeling_after_pct != null
                            ? l.feeling_after_pct
                            : normalize(l.feeling_after, l.feeling_scale ?? 5);
                    return sum + (v ?? 0);
                }, 0) / logsWithBothFeelings.length
            ).toFixed(1)
            : null;

    // Gemiddelde sessieduur in seconden omzetten naar min.sec
    const avgDuration =
        logs.filter((l) => l.session_duration > 0).length > 0
            ? Math.round(
                logs
                    .filter((l) => l.session_duration > 0)
                    .reduce((sum, l) => sum + (l.session_duration ?? 0), 0) /
                logs.filter((l) => l.session_duration > 0).length
            )
            : null;

    const formatDuration = (sec) => {
        if (sec == null) return "–";
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${String(s).padStart(2, "0")} min`;
    };

    const weekData = groupByWeek(logsWithBothFeelings);

    const activeGroupName =
        activeTab === "algemeen"
            ? "Algemene vraag voor cliënten"
            : researchGroups.find((g) => String(g.id) === activeTab)?.name ?? "Groep";

    return (
        <div className="space-y-6">
            {/* Titel */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Gevoelsmetingen</h2>
                {/* text-gray-700 ipv text-gray-500: contrast was 4.39 op bg-gray-100, nu voldoende */}
                <p className="text-sm text-gray-700 mt-0.5">
                    Genormaliseerde scores (0–100) — 3-schaal en 5-schaal zijn vergelijkbaar
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <TabButton
                    active={activeTab === "algemeen"}
                    onClick={() => setActiveTab("algemeen")}
                >
                    Algemene vraag voor cliënten
                </TabButton>
                {researchGroups.map((g) => (
                    <TabButton
                        key={g.id}
                        active={activeTab === String(g.id)}
                        onClick={() => setActiveTab(String(g.id))}
                    >
                        {g.name}
                    </TabButton>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
                <div>
                    <label htmlFor="filter-exercise" className="block text-xs text-gray-700 mb-1">
                        Oefening
                    </label>
                    <select
                        id="filter-exercise"
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                        <option value="">Alle oefeningen</option>
                        {exercises.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                                {ex.exercise_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="filter-date-from" className="block text-xs text-gray-700 mb-1">
                        Van
                    </label>
                    <input
                        id="filter-date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>
                <div>
                    <label htmlFor="filter-date-to" className="block text-xs text-gray-700 mb-1">
                        Tot
                    </label>
                    <input
                        id="filter-date-to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>
                {(selectedExercise || dateFrom || dateTo) && (
                    <button
                        onClick={() => {
                            setSelectedExercise("");
                            setDateFrom("");
                            setDateTo("");
                        }}
                        className="text-xs text-purple-600 underline mt-4"
                    >
                        Filters wissen
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-2 text-gray-500 py-8">
                    <svg className="animate-spin h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Laden…
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-3">
                        <StatCard label="Actieve cliënten" value={activeClients} />
                        <StatCard label="Metingen gedaan" value={totalMeasurements} />
                        <StatCard
                            label="Gem. gevoel voor"
                            value={avgBefore != null ? `${avgBefore}` : "–"}
                            sub="score / 100"
                        />
                        <StatCard
                            label="Gem. gevoel na"
                            value={avgAfter != null ? `${avgAfter}` : "–"}
                            sub="score / 100"
                        />
                        <StatCard
                            label="Gem. sessieduur"
                            value={formatDuration(avgDuration)}
                        />
                    </div>

                    {/* diagram */}
                    {weekData.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-1">
                                Gevoel voor en na oefening
                            </h3>
                            <p className="text-xs text-gray-600 mb-5">
                                Gemiddelde score per week – {activeGroupName} (anoniem) · scores 0–100
                            </p>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={weekData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        formatter={(value) =>
                                            value === "voor" ? "Gevoel voor oefening" : "Gevoel na oefening"
                                        }
                                    />
                                    <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="4 4" />
                                    <Line
                                        type="monotone"
                                        dataKey="voor"
                                        name="voor"
                                        stroke="#B85B06"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "#B85B06" }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="na"
                                        name="na"
                                        stroke="#6C4092"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#6C4092" }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 italic">
                            Geen data gevonden voor deze selectie.
                        </div>
                    )}

                    {/* Verbetering-tabel per week */}
                    {weekData.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h3 className="text-base font-semibold text-gray-800 mb-4">
                                Verschil (na − voor) per week
                            </h3>
                            <div className="overflow-x-auto" tabIndex={0}>
                                <table className="min-w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 pr-6 text-gray-500 font-medium">Week</th>
                                        <th className="text-right py-2 pr-6 text-gray-500 font-medium">Gem. voor</th>
                                        <th className="text-right py-2 pr-6 text-gray-500 font-medium">Gem. na</th>
                                        <th className="text-right py-2 text-gray-500 font-medium">Verschil</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {weekData.map((row) => {
                                        const diff =
                                            row.voor != null && row.na != null
                                                ? row.na - row.voor
                                                : null;
                                        return (
                                            <tr key={row.week} className="border-b border-gray-50">
                                                <td className="py-2 pr-6 font-medium text-gray-700">{row.week}</td>
                                                <td className="py-2 pr-6 text-right text-gray-600">{row.voor ?? "–"}</td>
                                                <td className="py-2 pr-6 text-right text-gray-600">{row.na ?? "–"}</td>
                                                <td className="py-2 text-right font-semibold"
                                                    style={{color: diff == null ? "#9ca3af" : diff >= 0 ? "#15803d" : "#b91c1c"}}
                                                >
                                                    {diff == null ? "–" : (diff >= 0 ? "+" : "") + diff}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${
                active
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
            }`}
            style={active ? { backgroundColor: "#6C4092", borderColor: "#6C4092" } : {}}
        >
            {children}
        </button>
    );
}
