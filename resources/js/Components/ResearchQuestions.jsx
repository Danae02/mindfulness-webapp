import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import EmoticonPicker from "@/Components/EmoticonPicker";


function SectionCard({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">{title}</h2>
            {children}
        </div>
    );
}

function PurpleButton({ onClick, disabled, children, variant = "primary" }) {
    const base = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed";
    const styles = {
        primary: `${base} text-white`,
        secondary: `${base} bg-transparent border-4 font-semibold`,
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
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
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
        success: "bg-green-50 text-green-800 border border-green-200",
        error: "bg-red-50 text-red-800 border border-red-200",
    };
    return (
        <div className={`rounded-lg px-4 py-2 text-sm mb-4 ${styles[type]}`}>
            {message}
        </div>
    );
}

// Standaardvraag sectie met emoticons
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

            const formattedAnswers = parsed.length ? parsed : Array(count).fill({ text: "", icon: null });
            setAnswers(formattedAnswers);
        }).catch(() => {
            setStatus({ message: "Kon instellingen niet laden.", type: "error" });
        }).finally(() => setLoading(false));
    }, []);

    const handleAnswerChange = (index, field, value) => {
        setAnswers((prev) => {
            const updated = [...prev];
            if (!updated[index]) {
                updated[index] = { text: "", icon: null };
            }
            updated[index][field] = value;
            return updated;
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
                message: `Voeg bij alle antwoorden een emoticon toe, of bij geen enkel. Nu ${withIcon} van de ${answerCount} antwoorden heeft een emoticon.`,
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

    if (loading) return <p className="text-sm text-gray-400">Laden…</p>;

    return (
        <>
            <StatusMessage message={status?.message} type={status?.type} />

            {!isEditing ? (
                <div className="relative border-2 rounded-xl p-6 pt-8 mt-4" style={{ borderColor: "#6C4092" }}>
                    {/* Pilvormige badge in de border */}
                    <div className="absolute -top-3 left-4">
                        <div className="text-white text-sm font-semibold px-4 py-1 rounded-full" style={{ backgroundColor: "#6C4092" }}>
                            Standaardvraag
                        </div>
                    </div>

                    <div className="text-center mb-5">
                        <p className="text-lg font-medium text-gray-800">
                            {question || <span className="text-gray-400 italic">Geen vraag ingesteld</span>}
                        </p>
                    </div>

                    <div className="flex justify-center gap-6">
                        {answers.slice(0, answerCount).map((a, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                {a?.icon?.src ? (
                                    <img
                                        src={a.icon.src}
                                        alt={a.icon.label}
                                        className="w-8 h-8 object-contain"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: "#6C4092" }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                )}
                                <span className="text-sm text-gray-700">{a?.text || "?"}</span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-5 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            {answerCount} antwoordopties · Per oefening · <span className="font-medium" style={{ color: "#6C4092" }}>Actief voor alle niet-groep cliënten</span>
                        </p>
                    </div>

                    <div className="flex justify-end mt-4">
                        <PurpleButton variant="secondary" onClick={() => setIsEditing(true)}>
                            Bewerken
                        </PurpleButton>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "#E9E3F0" }}>
                    <TextInput
                        label="Vraag"
                        id="default-question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Bijv. Hoe voel je je?"
                        required
                    />

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aantal antwoorden
                        </label>
                        <div className="flex gap-2">
                            {[3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setAnswerCount(n)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors
                                        ${answerCount === n
                                        ? "text-white border-transparent"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                                    }`}
                                    style={answerCount === n ? { backgroundColor: "#6C4092" } : {}}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Kies het aantal antwoordopties (3-5)
                        </p>
                    </div>

                    <p className="text-sm font-medium text-gray-700 mb-2">Antwoorden</p>
                    {Array.from({ length: answerCount }).map((_, i) => (
                        <div key={i} className="mb-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={answers[i]?.text || ""}
                                        onChange={(e) => handleAnswerChange(i, "text", e.target.value)}
                                        placeholder={`Antwoord ${i + 1}`}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                                                   focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                    />
                                </div>
                                <EmoticonPicker
                                    value={answers[i]?.icon || null}
                                    onChange={(icon) => handleAnswerChange(i, "icon", icon)}
                                    label={`Kies icoon voor antwoord ${i + 1}`}
                                />
                            </div>
                            {answers[i]?.icon?.src && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Geselecteerde emoticon: {answers[i].icon.label}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="flex gap-2 mt-2">
                        <div className="flex gap-2 mt-2">
                            <PurpleButton onClick={handleSave}>Opslaan</PurpleButton>
                            <PurpleButton variant="secondary"
                                          onClick={() => setIsEditing(false)}>Annuleren</PurpleButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Formulier voor één groep (aanmaken of bewerken)
function GroupForm({initial, onSave, onCancel}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [question, setQuestion] = useState(initial?.question ?? "");
    const [answerCount, setAnswerCount] = useState(
        initial?.answers?.length >= 3 ? initial.answers.length : 3
    );
    const [answers, setAnswers] = useState(() => {
        const base = initial?.answers ?? [];
        return Array(5).fill("").map((_, i) => {
            const val = base[i];
            if (typeof val === 'string') {
                return { text: val, icon: null };
            }
            return val ?? { text: "", icon: null };
        });
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleAnswerChange = (i, field, value) => {
        setAnswers((prev) => {
            const updated = [...prev];
            if (!updated[i]) {
                updated[i] = { text: "", icon: null };
            }
            updated[i][field] = value;
            return updated;
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
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
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

            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aantal antwoorden
                </label>
                <div className="flex gap-2">
                    {[3, 4, 5].map((n) => (
                        <button
                            key={n}
                            onClick={() => setAnswerCount(n)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors
                                ${answerCount === n
                                ? "bg-purple-700 text-white border-purple-700"
                                : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-2">Antwoorden</p>
            {Array.from({ length: answerCount }).map((_, i) => (
                <div key={i} className="mb-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={answers[i]?.text || ""}
                                onChange={(e) => handleAnswerChange(i, "text", e.target.value)}
                                placeholder={`Antwoord ${i + 1}`}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                                           focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                            />
                        </div>
                        <EmoticonPicker
                            value={answers[i]?.icon || null}
                            onChange={(icon) => handleAnswerChange(i, "icon", icon)}
                            label={`Kies icoon voor antwoord ${i + 1}`}
                        />
                    </div>
                    {answers[i]?.icon?.src && (
                        <p className="text-xs text-gray-400 mt-1">
                            Geselecteerde emoticon: {answers[i].icon.label}
                        </p>
                    )}
                </div>
            ))}

            <div className="flex gap-2 mt-3">
                <PurpleButton onClick={handleSubmit} disabled={saving}>
                    {saving ? "Opslaan…" : "Opslaan"}
                </PurpleButton>
                <PurpleButton variant="secondary" onClick={onCancel}>Annuleren</PurpleButton>
            </div>
        </div>
    );
}


// Gebruikersbeheer binnen een groep
function GroupMembers({ group, allUsers, onAddUser, onRemoveUser }) {
    const [selectedUserId, setSelectedUserId] = useState("");

    const available = allUsers.filter(
        (u) => u.research_group_id !== group.id && u.role_id !== 1 // geen admins
    );

    const handleAdd = () => {
        if (!selectedUserId) return;
        onAddUser(group.id, parseInt(selectedUserId));
        setSelectedUserId("");
    };

    return (
        <div className="mt-3 pt-3 border-t border-purple-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Leden</p>

            {group.users?.length > 0 ? (
                <ul className="space-y-1 mb-3">
                    {group.users.map((u) => (
                        <li key={u.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 text-sm border border-gray-100">
                            <span className="text-gray-800">{u.name}</span>
                            <button
                                onClick={() => onRemoveUser(group.id, u.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                                aria-label={`${u.name} verwijderen uit groep`}
                            >
                                Verwijderen
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400 italic mb-3">Nog geen leden</p>
            )}

            {available.length > 0 && (
                <div className="flex gap-2 items-center">
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
                    <PurpleButton onClick={handleAdd} disabled={!selectedUserId}>
                        Toevoegen
                    </PurpleButton>
                </div>
            )}
        </div>
    );
}

// Één groep
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
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{group.name}</p>
                            {group.question ? (
                                <p className="text-sm text-gray-600 mt-0.5">"{group.question}"</p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Geen vraag ingesteld</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                                {group.users?.length ?? 0} leden
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <PurpleButton variant="secondary" onClick={() => setIsEditing(true)}>
                                Bewerken
                            </PurpleButton>
                            <PurpleButton variant="danger" onClick={handleDelete}>
                                Verwijderen
                            </PurpleButton>
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
// Hoofdcomponent
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

    // Groep aanmaken
    const handleCreateGroup = async (data) => {
        const res = await axios.post(route("researchgroups.store"), data);
        setGroups((prev) => [...prev, res.data]);
        setShowNewGroupForm(false);
        flash("Groep aangemaakt.");
    };

    // Groep bijwerken
    const handleGroupUpdated = (updated) => {
        setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        flash("Groep opgeslagen.");
    };

    // Groep verwijderen
    const handleGroupDeleted = (id) => {
        setGroups((prev) => prev.filter((g) => g.id !== id));
        // Ontkoppel ook in de lokale gebruikerslijst
        setAllUsers((prev) =>
            prev.map((u) => u.research_group_id === id ? { ...u, research_group_id: null } : u)
        );
        flash("Groep verwijderd.");
    };

    // Gebruiker toevoegen aan groep
    const handleAddUser = async (groupId, userId) => {
        await axios.post(route("researchgroups.addUser", groupId), { user_id: userId });
        // Update lokale state: koppel gebruiker aan groep
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

    // Gebruiker verwijderen uit groep
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

    // pagina

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-purple-900 mb-2">Onderzoeksvragen</h1>
            <p className="text-gray-500 mb-6 text-sm">
                Maak hier de gevoelsvragen aan die een gebruiker vóór en na een oefening invult. De standaard vraag wordt gesteld aan alle cliënten zonder groep. Voor cliënten in een onderzoeksgroep geldt de vraag van die groep en vervangt die dus de standaard vraag.
            </p>
            <StatusMessage message={status?.message} type={status?.type} />

            <SectionCard title="Standaardvraag">
                <DefaultQuestion />
            </SectionCard>


            <SectionCard title="Onderzoeksgroepen">
                <p className="text-sm text-gray-500 mb-4">
                    Cliënten in een groep zien de groepsvraag in plaats van de standaardvraag.
                </p>

                {loading ? (
                    <p className="text-sm text-gray-400">Laden…</p>
                ) : (
                    <>
                        {groups.length === 0 && (
                            <p className="text-sm text-gray-400 italic mb-4">Nog geen groepen aangemaakt.</p>
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
