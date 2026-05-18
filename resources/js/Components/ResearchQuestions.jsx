import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import EmoticonPicker from "@/Components/EmoticonPicker";


function SectionCard({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">{title}</h2>
            {children}
        </div>
    );
}

function PurpleButton({ onClick, disabled, children, variant = "primary" }) {
    const base = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed";
    const styles = {
        primary: `${base} text-white`,
        secondary: `${base} bg-transparent border-2 font-semibold`,
        danger: `${base} text-white`,
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={styles[variant]}
            style={
                variant === "primary"
                    ? { backgroundColor: "#6C4092" }
                    : variant === "secondary"
                        ? { borderColor: "#6C4092", color: "#6C4092" }
                        : variant === "danger"
                            ? { backgroundColor: "#a5271a" }
                            : {}
            }
        >
            {children}
        </button>
    );
}

function TextInput({ label, id, value, onChange, placeholder, required }) {
    return (
        <div className="mb-3">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-800 mb-1">
                    {label}{required && <span className="text-red-600 ml-1">*</span>}
                </label>
            )}
            <input
                type="text"
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
        </div>
    );
}

function StatusMessage({ message, type }) {
    if (!message) return null;
    const styles = {
        success: "bg-green-600 text-white border border-green-700",
        error: "bg-red-600 text-white border border-red-700",
    };
    return (
        <div className={`rounded-lg px-4 py-2 text-sm mb-4 text-center ${styles[type]}`}>
            {message}
        </div>
    );
}

function AnswerRow({ index, answer, onChange, showNumber = true }) {
    return (
        <div className="flex gap-2 items-center">
            {showNumber && (
                <span className="text-sm font-bold text-purple-800 w-5 text-right flex-shrink-0">
                    {index + 1}
                </span>
            )}
            <div className="flex-1 min-w-0">
                <input
                    type="text"
                    value={answer?.text || ""}
                    onChange={(e) => onChange(index, "text", e.target.value)}
                    placeholder={`Antwoord ${index + 1}`}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
            </div>
            <EmoticonPicker
                value={answer?.icon || null}
                onChange={(icon) => onChange(index, "icon", icon)}
                label={`Kies icoon voor antwoord ${index + 1}`}
            />
        </div>
    );
}

const ScaleNotice = () => (
    <div className="flex items-start gap-2 rounded-lg px-3 py-2 mb-3 text-xs"
         style={{ backgroundColor: "#f0e8ff", border: "1px solid #c9b8e8" }}>
        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
             stroke="#6C4092" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ color: "#4A2B6D" }}>
            <strong>De volgorde bepaalt de waarde:</strong> antwoord 1 (bovenaan) wordt altijd
            opgeslagen als de laagste waarde <strong>(slechtst)</strong> en het laatste antwoord
            als de hoogste waarde <strong>(best)</strong>.
        </p>
    </div>
);

function AnswersEditor({ answerCount, answers, onAnswerChange }) {
    if (answerCount !== 5) {
        return (
            <div className="space-y-2">
                <ScaleNotice />
                {Array.from({ length: answerCount }).map((_, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <AnswerRow index={i} answer={answers[i]} onChange={onAnswerChange} />
                        {answers[i]?.icon?.src && (
                            <p className="text-xs text-gray-600 mt-1 ml-7">
                                Emoticon: {answers[i].icon.label}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    const SubScreen = ({ indices, label, color }) => (
        <div
            className="mt-2 rounded-xl p-3 space-y-2 border-2"
            style={{ backgroundColor: `${color}18`, borderColor: color }}
        >
            <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 10 10">
                    <path d="M2 0 L2 5 Q2 8 5 8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
                <span className="text-xs font-semibold" style={{ color: "#4A2B6D" }}>
                Vervolgscherm
            </span>
            </div>
            {indices.map((i) => (
                <div key={i} className="bg-white rounded-lg p-2.5 border" style={{ borderColor: `${color}40` }}>
                    <AnswerRow index={i} answer={answers[i]} onChange={onAnswerChange} />
                    {answers[i]?.icon?.src && (
                        <p className="text-xs text-gray-600 mt-1 ml-7">Emoticon: {answers[i].icon.label}</p>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-3">
            <ScaleNotice />
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <AnswerRow index={0} answer={answers[0]} onChange={onAnswerChange} />
                {answers[0]?.icon?.src && (
                    <p className="text-xs text-gray-600 mt-1 ml-7">Emoticon: {answers[0].icon.label}</p>
                )}
                <SubScreen indices={[0, 1]} label="Vervolgscherm" color="#7B5EA7" />
            </div>

            <div className="p-3 border-2 border-dashed rounded-lg" style={{ borderColor: "#6C4092", backgroundColor: "#faf8ff" }}>
                <AnswerRow index={2} answer={answers[2]} onChange={onAnswerChange} />
                {answers[2]?.icon?.src && (
                    <p className="text-xs text-gray-600 mt-1 ml-7">Emoticon: {answers[2].icon.label}</p>
                )}
                <div className="flex items-center gap-1.5 mt-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6C4092"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="w-4 h-4 flex-shrink-0"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    <p className="text-xs text-purple-800 font-medium">
                        Geen vervolgscherm, middelste optie gaat direct door
                    </p>
                </div>
            </div>

            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <AnswerRow index={4} answer={answers[4]} onChange={onAnswerChange} />
                {answers[4]?.icon?.src && (
                    <p className="text-xs text-gray-600 mt-1 ml-7">Emoticon: {answers[4].icon.label}</p>
                )}
                <SubScreen indices={[3, 4]} label="Vervolgscherm" color="#7B5EA7" />
            </div>

            <p className="text-xs text-gray-600 mt-1 px-1">
                Bij 5 antwoorden ziet de gebruiker eerst 3 globale opties. Kiest hij de eerste of laatste, dan volgt een tweede verfijningsstap.
            </p>
        </div>
    );
}


//standaard vraag sectie
function DefaultQuestion() {
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState([]);
    const [answerCount, setAnswerCount] = useState(3);
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(route("research.questions.default")).then((res) => {
            setQuestion(res.data.question ?? "");
            const raw = res.data.answers;
            const parsed = Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []);
            const count = parsed.length >= 3 ? parsed.length : 3;
            setAnswerCount(count);

            const formattedAnswers = parsed.length ? parsed : Array(5).fill({ text: "", icon: null });
            setAnswers(formattedAnswers);
        }).catch(() => {
            setStatus({ message: "Kon instellingen niet laden.", type: "error" });
        }).finally(() => setLoading(false));
    }, []);

    const handleAnswerChange = (index, field, value) => {
        setAnswers((prev) => {
            const updated = [...prev];
            if (!updated[index]) updated[index] = { text: "", icon: null };

            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAnswerCountChange = (n) => {
        setAnswerCount(n);

        setAnswers((prev) => {
            const copy = [...prev];
            while (copy.length < n) copy.push({ text: "", icon: null });
            return copy;
        });
    };

    const handleSave = async () => {
        const answersToSave = answers.slice(0, answerCount);

        const emptyCount = answersToSave.filter(a => !a?.text?.trim()).length;
        if (emptyCount > 0) {
            setStatus({ message: `Vul alle ${answerCount} antwoorden in voordat je opslaat.`, type: "error" });
            return;
        }

        const withIcon = answersToSave.filter(a => a?.icon?.src).length;
        if (withIcon > 0 && withIcon < answerCount) {
            setStatus({
                message: `Voeg bij alle antwoorden een emoticon toe, of bij geen enkel. Nu heeft ${withIcon} van de ${answerCount} antwoorden een emoticon.`,
                type: "error"
            });
            return;
        }

        try {
            await axios.post(route("research.questions.default.save"), {
                question,
                answers: answersToSave,
            });
            setStatus({ message: "Standaardvraag opgeslagen.", type: "success" });
            setIsEditing(false);
        } catch (err) {
            const msg = err.response?.data?.message ?? "Er ging iets mis.";
            setStatus({ message: msg, type: "error" });
        }
    };

    if (loading) return <p className="text-sm text-gray-500">Laden…</p>;

    return (
        <>
            <StatusMessage message={status?.message} type={status?.type} />

            {!isEditing ? (
                <div className="relative border-2 rounded-xl p-4 sm:p-6 pt-8 mt-4" style={{ borderColor: "#6C4092" }}>
                    <div className="absolute -top-3 left-4">
                        <div className="text-white text-sm font-semibold px-4 py-1 rounded-full" style={{ backgroundColor: "#6C4092" }}>
                            Standaardvraag
                        </div>
                    </div>

                    <div className="text-center mb-5">
                        <p className="text-lg font-medium text-gray-800">
                            {question || <span className="text-gray-500 italic">Geen vraag ingesteld</span>}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                        {answers.slice(0, answerCount).map((a, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 min-w-0" style={{ maxWidth: "64px" }}>
                                {a?.icon?.src ? (
                                    <img src={a.icon.src} alt={a.icon.label} className="w-8 h-8 object-contain flex-shrink-0" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: "#6C4092" }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                )}
                                <span className="text-xs text-gray-700 text-center leading-tight break-words w-full">
                                    {a?.text || "?"}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-5 pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {answerCount} antwoordopties · Per oefening ·{" "}
                            <span className="font-medium" style={{ color: "#6C4092" }}>Actief voor alle niet-groep cliënten</span>
                        </p>
                    </div>

                    <div className="flex justify-end mt-4">
                        <PurpleButton variant="secondary" onClick={() => setIsEditing(true)}>
                            Bewerken
                        </PurpleButton>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6" style={{ borderColor: "#E9E3F0" }}>
                    <TextInput
                        label="Vraag"
                        id="default-question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Bijv. Hoe voel je je?"
                        required
                    />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                            Aantal antwoorden
                        </label>
                        <div className="flex gap-2">
                            {[3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => handleAnswerCountChange(n)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors
                                        ${answerCount === n
                                        ? "text-white border-transparent"
                                        : "bg-white text-gray-800 border-gray-300 hover:border-purple-400"
                                    }`}
                                    style={answerCount === n ? { backgroundColor: "#6C4092" } : {}}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        {answerCount === 5 && (
                            <p className="text-xs text-purple-700 mt-1 font-medium">
                                Bij 5 opties ziet de gebruiker een twee-stappen vraag.
                            </p>
                        )}
                    </div>

                    <p className="text-sm font-medium text-gray-800 mb-2">
                        Antwoordopties instellen
                        <span className="text-red-600 ml-1">*</span>
                    </p>
                    <AnswersEditor
                        answerCount={answerCount}
                        answers={answers}
                        onAnswerChange={handleAnswerChange}
                    />

                    <div className="flex gap-2 mt-4">
                        <PurpleButton onClick={handleSave}>Opslaan</PurpleButton>
                        <PurpleButton variant="secondary" onClick={() => setIsEditing(false)}>Annuleren</PurpleButton>
                    </div>
                </div>
            )}
        </>
    );
}


// formulier voor aanmaken/bewerken van een onderzoeksgroep
function GroupForm({ initial, onSave, onCancel }) {
    const [name, setName] = useState(initial?.name ?? "");
    const [question, setQuestion] = useState(initial?.question ?? "");
    const [answerCount, setAnswerCount] = useState(
        initial?.answers?.length >= 3 ? initial.answers.length : 3
    );
    const [answers, setAnswers] = useState(() => {
        const base = initial?.answers ?? [];
        return Array(5).fill(null).map((_, i) => {
            const val = base[i];
            if (typeof val === 'string') return { text: val, icon: null };
            return val ?? { text: "", icon: null };
        });
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleAnswerChange = (i, field, value) => {
        setAnswers((prev) => {
            const updated = [...prev];
            if (!updated[i]) updated[i] = { text: "", icon: null };
            updated[i] = { ...updated[i], [field]: value };
            return updated;
        });
    };

    const handleAnswerCountChange = (n) => {
        setAnswerCount(n);
        setAnswers((prev) => {
            const copy = [...prev];
            while (copy.length < n) copy.push({ text: "", icon: null });
            return copy;
        });
    };

    const handleSubmit = async () => {
        if (!name.trim()) { setError("Geef de groep een naam."); return; }

        const answersToSave = answers.slice(0, answerCount);
        const emptyCount = answersToSave.filter(a => !a?.text?.trim()).length;
        if (emptyCount > 0) {
            setError(`Vul alle ${answerCount} antwoorden in voordat je opslaat.`);
            return;
        }

        const withIcon = answersToSave.filter(a => a?.icon?.src).length;
        if (withIcon > 0 && withIcon < answerCount) {
            setError(`Voeg bij alle antwoorden een emoticon toe, of bij geen enkel. Nu heeft ${withIcon} van de ${answerCount} antwoorden een emoticon.`);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await onSave({ name, question, answers: answersToSave });
        } catch (err) {
            setError(err.response?.data?.message ?? "Er ging iets mis.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-purple-100 border border-purple-300 rounded-xl p-4 mb-4">
            {error && <StatusMessage message={error} type="error" />}

            <TextInput
                label="Groepsnaam"
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv. Groep A"
                required
            />
            <TextInput
                label="Vraag"
                id="group-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Bijv. Hoe voelde je je tijdens de oefening?"
            />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                    Aantal antwoorden
                </label>
                <div className="flex gap-2">
                    {[3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => handleAnswerCountChange(n)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors
                                ${answerCount === n
                                ? "text-white border-transparent"
                                : "bg-white text-gray-800 border-gray-300 hover:border-purple-400"
                            }`}
                            style={answerCount === n ? { backgroundColor: "#6C4092" } : {}}
                        >
                            {n}
                        </button>
                    ))}
                </div>
                {answerCount === 5 && (
                    <p className="text-xs text-purple-700 mt-1 font-medium">
                        Bij 5 opties ziet de gebruiker een twee-stappen vraag.
                    </p>
                )}
            </div>

            <p className="text-sm font-medium text-gray-800 mb-2">
                Antwoordopties instellen
                <span className="text-red-600 ml-1">*</span>
            </p>
            <AnswersEditor
                answerCount={answerCount}
                answers={answers}
                onAnswerChange={handleAnswerChange}
            />

            <div className="flex gap-2 mt-4">
                <PurpleButton onClick={handleSubmit} disabled={saving}>
                    {saving ? "Opslaan…" : "Opslaan"}
                </PurpleButton>
                <PurpleButton variant="secondary" onClick={onCancel}>Annuleren</PurpleButton>
            </div>
        </div>
    );
}


// gebruikersbeheer binnen een groep
function GroupMembers({ group, allUsers, onAddUser, onRemoveUser }) {
    const [selectedUserId, setSelectedUserId] = useState("");

    const available = allUsers.filter(
        (u) => u.research_group_id !== group.id && u.role_id !== 1
    );

    const handleAdd = () => {
        if (!selectedUserId) return;
        onAddUser(group.id, parseInt(selectedUserId));
        setSelectedUserId("");
    };

    return (
        <div className="mt-3 pt-3 border-t border-purple-200">
            <p className="text-sm font-medium text-gray-800 mb-2">Leden</p>
            {group.users?.length > 0 ? (
                <ul className="space-y-1 mb-3">
                    {group.users.map((u) => (
                        <li key={u.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 text-sm border border-gray-200 gap-2">
                            <span className="text-gray-800 min-w-0 truncate">{u.name}</span>
                            <button
                                onClick={() => onRemoveUser(group.id, u.id)}
                                className="text-xs font-medium flex-shrink-0"
                                style={{ color: "#A5271A" }}
                                aria-label={`${u.name} verwijderen uit groep`}
                            >
                                Verwijderen
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 italic mb-3">Nog geen leden</p>
            )}

            {available.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        aria-label="Selecteer een gebruiker om toe te voegen"
                    >
                        <option value="">Selecteer gebruiker…</option>
                        {available.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <PurpleButton onClick={handleAdd} disabled={!selectedUserId}>Toevoegen</PurpleButton>
                </div>
            )}
        </div>
    );
}


function GroupCard({ group, allUsers, onUpdated, onDeleted, onAddUser, onRemoveUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showMembers, setShowMembers] = useState(false);

    const handleSave = async (data) => {
        const res = await axios.put(route("researchgroups.update", group.id), data);
        onUpdated(res.data);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm(`Groep "${group.name}" verwijderen? Leden worden losgekoppeld.`)) return;
        await axios.delete(route("researchgroups.destroy", group.id));
        onDeleted(group.id);
    };

    return (
        <div className="relative border-2 rounded-xl p-4 mb-3" style={{ borderColor: "#6C4092" }}>
            {isEditing ? (
                <GroupForm
                    initial={group}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{group.name}</p>
                            {group.question ? (
                                <p className="text-sm text-gray-700 mt-0.5 break-words">"{group.question}"</p>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Geen vraag ingesteld</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">{group.users?.length ?? 0} leden</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <PurpleButton variant="secondary" onClick={() => setIsEditing(true)}>Bewerken</PurpleButton>
                            <PurpleButton variant="danger" onClick={handleDelete}>Verwijderen</PurpleButton>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowMembers((v) => !v)}
                        className="mt-3 text-sm font-medium focus:outline-none flex items-center gap-1"
                        style={{ color: "#6C4092" }}
                        aria-expanded={showMembers}
                    >
                        {showMembers ? "Leden verbergen" : `Leden beheren (${group.users?.length ?? 0})`}
                    </button>

                    {showMembers && (
                        <GroupMembers
                            group={group}
                            allUsers={allUsers}
                            onAddUser={onAddUser}
                            onRemoveUser={onRemoveUser}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default function ResearchQuestions() {
    const [groups, setGroups] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [showNewGroupForm, setShowNewGroupForm] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const flash = useCallback((message, type = "success") => {
        setStatus({ message, type });
        setTimeout(() => setStatus(null), 4000);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const [groupsRes, usersRes] = await Promise.all([
                axios.get(route("researchgroups.index")),
                axios.get(route("users.index")),
            ]);
            setGroups(groupsRes.data);
            setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users ?? []);
        } catch {
            flash("Kon gegevens niet laden.", "error");
        } finally {
            setLoading(false);
        }
    }, [flash]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreateGroup = async (data) => {
        const res = await axios.post(route("researchgroups.store"), data);
        setGroups((prev) => [...prev, res.data]);
        setShowNewGroupForm(false);
        flash("Groep aangemaakt.");
    };

    const handleGroupUpdated = (updated) => {
        setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        flash("Groep opgeslagen.");
    };

    const handleGroupDeleted = (id) => {
        setGroups((prev) => prev.filter((g) => g.id !== id));
        setAllUsers((prev) =>
            prev.map((u) => u.research_group_id === id ? { ...u, research_group_id: null } : u)
        );
        flash("Groep verwijderd.");
    };

    const handleAddUser = async (groupId, userId) => {
        await axios.post(route("researchgroups.addUser", groupId), { user_id: userId });
        setAllUsers((prev) =>
            prev.map((u) => u.id === userId ? { ...u, research_group_id: groupId } : u)
        );
        setGroups((prev) =>
            prev.map((g) => {
                if (g.id !== groupId) return g;
                const user = allUsers.find((u) => u.id === userId);
                return { ...g, users: [...(g.users ?? []), { ...user, research_group_id: groupId }] };
            })
        );
        flash("Gebruiker toegevoegd.");
    };

    const handleRemoveUser = async (groupId, userId) => {
        await axios.delete(route("researchgroups.removeUser", { groupId, userId }));
        setAllUsers((prev) =>
            prev.map((u) => u.id === userId ? { ...u, research_group_id: null } : u)
        );
        setGroups((prev) =>
            prev.map((g) => {
                if (g.id !== groupId) return g;
                return { ...g, users: g.users.filter((u) => u.id !== userId) };
            })
        );
        flash("Gebruiker losgekoppeld.");
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-2">Onderzoeksvragen</h1>
            <p className="text-gray-700 mb-6 text-sm">
                Maak hier de gevoelsvragen aan die een gebruiker vóór en na een oefening invult. De standaard vraag wordt gesteld aan alle cliënten zonder groep. Voor cliënten in een onderzoeksgroep geldt de vraag van die groep en vervangt die dus de standaard vraag.
            </p>
            <StatusMessage message={status?.message} type={status?.type} />

            <SectionCard title="Standaardvraag">
                <DefaultQuestion />
            </SectionCard>

            <SectionCard title="Onderzoeksgroepen">
                <p className="text-gray-700 mb-4 text-sm">
                    Cliënten in een groep zien de groepsvraag in plaats van de standaardvraag.
                </p>

                {loading ? (
                    <p className="text-sm text-gray-500">Laden…</p>
                ) : (
                    <>
                        {groups.length === 0 && (
                            <p className="text-sm text-gray-500 italic mb-4">Nog geen groepen aangemaakt.</p>
                        )}
                        {groups.map((group) => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                allUsers={allUsers}
                                onUpdated={handleGroupUpdated}
                                onDeleted={handleGroupDeleted}
                                onAddUser={handleAddUser}
                                onRemoveUser={handleRemoveUser}
                            />
                        ))}
                        {showNewGroupForm ? (
                            <GroupForm
                                onSave={handleCreateGroup}
                                onCancel={() => setShowNewGroupForm(false)}
                            />
                        ) : (
                            <PurpleButton onClick={() => setShowNewGroupForm(true)}>
                                + Nieuwe groep
                            </PurpleButton>
                        )}
                    </>
                )}
            </SectionCard>
        </div>
    );
}
