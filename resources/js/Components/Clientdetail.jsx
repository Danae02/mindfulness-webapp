import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

// Helpers
function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('nl-NL', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

function formatDuration(minutes) {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} u ${m} min` : `${h} uur`;
}

function getInitials(name) {
    return (name ?? '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

// Iconen
const Icons = {
    clipboard: <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    heart:     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    music:     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
};

// Sub-componenten
function LoadingSpinner({ label = 'Laden…' }) {
    return (
        <div className="flex justify-center py-10" role="status" aria-label={label}>
            <div className="w-8 h-8 border-4 border-[#D4C5E8] border-t-[#7B5EA7] rounded-full animate-spin" aria-hidden="true" />
            <span className="sr-only">{label}</span>
        </div>
    );
}

function EmptyState({ icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400" role="status" aria-live="polite">
            <span className="mb-3" aria-hidden="true">{icon}</span>
            <p className="text-sm">{message}</p>
        </div>
    );
}

function StatusBadge({ completed }) {
    return completed
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700" aria-label="Voltooid"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Voltooid</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700" aria-label="Gestart"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" strokeWidth={2}/></svg> Gestart</span>;
}

// Tabmenubalk
function TabVoortgang({ progress, loading }) {
    if (loading) return <LoadingSpinner label="Voortgang laden…" />;
    if (!progress.length) return <EmptyState icon={Icons.clipboard} message="Nog geen cursussen gevonden." />;

    return (
        <div className="space-y-6">
            {progress.map((course) => (
                <div key={course.course_id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 bg-[#F5F0FA] border-b border-[#EAE0F5]">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm">{course.course_name}</h3>
                            <span className="text-xs text-gray-500">{course.done}/{course.total} voltooid</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden" role="img" aria-label={`Voortgang: ${course.progress}%`}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${course.progress}%`, backgroundColor: '#7B5EA7' }}
                            />
                        </div>
                        {!course.available && (
                            <p className="text-xs text-gray-400 mt-1">Nog niet open voor deze cliënt</p>
                        )}
                    </div>

                    {course.exercises && course.exercises.length > 0 && (
                        <ul className="divide-y divide-gray-100">
                            {course.exercises.map((ex) => (
                                <li
                                    key={ex.exercise_id}
                                    className="px-5 py-3 flex items-center justify-between gap-3"
                                    aria-label={`Oefening: ${ex.exercise_name}${ex.completed ? ', voltooid op ' + formatDate(ex.last_completed_at) : ', nog niet voltooid'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{ex.exercise_name}</p>
                                        {ex.completed && ex.last_completed_at && (
                                            <p className="text-xs text-gray-400 mt-0.5">Voltooid op {formatDate(ex.last_completed_at)}</p>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        {ex.completed
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Gedaan</span>
                                            : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" strokeWidth={2}/></svg> Nog open</span>
                                        }
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}


function TabFavorieten({ favorites, loading, onToggle, toggling }) {
    if (loading) return <LoadingSpinner label="Favorieten laden…" />;

    return (
        <div>
            {favorites.length === 0 && (
                <EmptyState icon={Icons.heart} message="Nog geen favoriete oefeningen." />
            )}
            <ul className="divide-y divide-gray-100" aria-label="Favoriete oefeningen">
                {favorites.map((ex) => (
                    <li key={ex.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{ex.exercise_name}</p>
                            {ex.duration && (
                                <p className="text-xs text-gray-400">{formatDuration(ex.duration)}</p>
                            )}
                        </div>
                        <button
                            onClick={() => onToggle(ex)}
                            disabled={toggling === ex.id}
                            className="inline-flex items-center shrink-0 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-colors disabled:opacity-50"
                            aria-label={`Verwijder ${ex.exercise_name} uit favorieten`}
                        >
                            {toggling === ex.id ? '…' : (
                                <>
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                    Verwijderen
                                </>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}


function TabOefeningen({ clientId, favorites, loading, onStartExercise, onToggleFavorite, toggling }) {
    const [courses,        setCourses]        = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [availability,   setAvailability]   = useState({});
    const [availLoading,   setAvailLoading]   = useState(false);

    useEffect(() => {
        if (!clientId) return;
        setCoursesLoading(true);

        axios.get(route('courses.get.all'))
            .then(async (r) => {
                const withExercises = await Promise.all(
                    r.data.map(async (course) => {
                        if (course.is_intro) return null;
                        try {
                            const er = await axios.get(route('courses.exercises', course.id));
                            return { ...course, exercises: er.data };
                        } catch {
                            return { ...course, exercises: [] };
                        }
                    })
                );
                setCourses(withExercises.filter(Boolean));
            })
            .catch(e => console.error('Fout bij ophalen cursussen:', e))
            .finally(() => setCoursesLoading(false));
    }, [clientId]);

    const handleExpandCourse = async (courseId) => {
        if (expandedCourse === courseId) { setExpandedCourse(null); return; }
        setExpandedCourse(courseId);

        if (!availability[courseId]) {
            setAvailLoading(true);
            try {
                const res = await axios.get(route('courses.availability.for.user', {
                    courseId: courseId,
                    userId: clientId,
                }));
                const map = {};
                res.data.forEach(item => {
                    map[item.exercise_id] = { available: item.available, available_label: item.available_label };
                });
                setAvailability(prev => ({ ...prev, [courseId]: map }));
            } catch (e) {
                console.error('Fout bij ophalen beschikbaarheid:', e);
            } finally {
                setAvailLoading(false);
            }
        }
    };

    if (coursesLoading) return <LoadingSpinner label="Oefeningen laden…" />;
    if (!courses.length) return <EmptyState icon={Icons.music} message="Geen cursussen te doen." />;

    const isFav = (id) => favorites.some(f => f.id === id);

    return (
        <div className="space-y-3">
            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                De slotjes tonen de beschikbaarheid voor <strong>deze cliënt</strong>. Je kunt altijd een open oefening samen doen, inclusief gevoelsvragen.
            </p>

            {courses.map((course) => {
                const courseAvail = availability[course.id] || {};
                const isExpanded  = expandedCourse === course.id;

                return (
                    <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#F5F0FA] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-inset transition-colors"
                            onClick={() => handleExpandCourse(course.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`course-panel-${course.id}`}
                            id={`course-btn-${course.id}`}
                        >
                            <span className="font-semibold text-gray-800">{course.title ?? course.course_name}</span>
                            <span
                                className="text-[#7B5EA7] transition-transform duration-200 inline-flex"
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                aria-hidden="true"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </button>

                        {isExpanded && (
                            <div id={`course-panel-${course.id}`} role="region" aria-labelledby={`course-btn-${course.id}`}>
                                {availLoading && (
                                    <div className="px-5 py-3 text-sm text-gray-400">Beschikbaarheid laden…</div>
                                )}
                                {(!course.exercises || course.exercises.length === 0) ? (
                                    <p className="px-5 py-4 text-sm text-gray-400">Geen oefeningen in deze cursus.</p>
                                ) : (
                                    <ul className="divide-y divide-gray-100 bg-gray-50" aria-label={`Oefeningen van ${course.title ?? course.course_name}`}>
                                        {course.exercises.map((ex) => {
                                            const avail       = courseAvail[ex.id];
                                            const isAvailable = avail ? avail.available : true;
                                            const availLabel  = avail?.available_label;

                                            return (
                                                <li key={ex.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium truncate ${isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                                                            {ex.exercise_name}
                                                        </p>
                                                        {ex.duration && (
                                                            <p className="text-xs text-gray-400">{formatDuration(ex.duration)}</p>
                                                        )}
                                                        {!isAvailable && availLabel && (
                                                            <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                                {availLabel}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            onClick={() => onToggleFavorite(ex)}
                                                            disabled={toggling === ex.id}
                                                            className={`px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors disabled:opacity-50 ${
                                                                isFav(ex.id)
                                                                    ? 'border-amber-300 text-amber-600 hover:bg-amber-50 focus:ring-amber-400'
                                                                    : 'border-gray-300 text-gray-500 hover:bg-gray-100 focus:ring-gray-400'
                                                            }`}
                                                            aria-label={isFav(ex.id)
                                                                ? `Verwijder ${ex.exercise_name} uit favorieten van cliënt`
                                                                : `Voeg ${ex.exercise_name} toe aan favorieten van cliënt`}
                                                            aria-pressed={isFav(ex.id)}
                                                        >
                                                            {toggling === ex.id ? '…' : isFav(ex.id)
                                                                ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                                            }
                                                        </button>

                                                        {isAvailable ? (
                                                            <button
                                                                onClick={() => onStartExercise(ex)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
                                                                style={{ backgroundColor: '#7B5EA7' }}
                                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6a4e8e'}
                                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B5EA7'}
                                                                aria-label={`Start oefening ${ex.exercise_name} samen met cliënt`}
                                                            >
                                                                Samen doen
                                                            </button>
                                                        ) : (
                                                            <span
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                aria-label={`Oefening ${ex.exercise_name} is nog niet open voor deze cliënt`}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                                Nog niet open
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


const TABS = [
    { id: 'voortgang',  label: 'Voortgang'       },
    { id: 'favorieten', label: 'Favorieten'       },
    { id: 'oefeningen', label: 'Oefening starten' },
];

// ClientDetail

export default function ClientDetail({ client, onClose }) {
    const [activeTab,    setActiveTab]    = useState('voortgang');
    const [progress,     setProgress]     = useState([]);
    const [favorites,    setFavorites]    = useState([]);
    const [dataLoading,  setDataLoading]  = useState(true);
    const [toggling,     setToggling]     = useState(null);
    const [announcement, setAnnouncement] = useState('');

    const closeBtnRef = useRef(null);
    const tabsRef     = useRef([]);

    const announce = (msg) => { setAnnouncement(msg); setTimeout(() => setAnnouncement(''), 2000); };

    useEffect(() => {
        setDataLoading(true);
        setProgress([]);
        setFavorites([]);
        setActiveTab('voortgang');

        Promise.all([
            axios.get(route('users.progress', client.id)),
            axios.get(route('users.favorites', client.id)),
        ]).then(([progressRes, favsRes]) => {
            setProgress(progressRes.data);
            setFavorites(favsRes.data);
        }).catch(err => {
            console.error('Fout bij ophalen cliëntdata:', err);
        }).finally(() => {
            setDataLoading(false);
        });
    }, [client.id]);

    const handleTabKeyDown = (e, idx) => {
        if (e.key === 'ArrowRight') { const next = (idx + 1) % TABS.length; tabsRef.current[next]?.focus(); }
        if (e.key === 'ArrowLeft')  { const prev = (idx - 1 + TABS.length) % TABS.length; tabsRef.current[prev]?.focus(); }
        if (e.key === 'Home')       { tabsRef.current[0]?.focus(); }
        if (e.key === 'End')        { tabsRef.current[TABS.length - 1]?.focus(); }
    };

    const handleToggleFavorite = async (exercise) => {
        setToggling(exercise.id);
        const wasFav = favorites.some(f => f.id === exercise.id);
        try {
            await axios.post(route('favorites.toggle'), {
                exercise_id: exercise.id,
                for_user_id: client.id,
            });
            if (wasFav) {
                setFavorites(prev => prev.filter(f => f.id !== exercise.id));
                announce(`${exercise.exercise_name} verwijderd uit favorieten van ${client.name}.`);
            } else {
                setFavorites(prev => [...prev, exercise]);
                announce(`${exercise.exercise_name} toegevoegd aan favorieten van ${client.name}.`);
            }
        } catch (err) {
            console.error('Fout bij favoriet toggle:', err);
            announce('Er is een fout opgetreden bij het opslaan.');
        } finally {
            setToggling(null);
        }
    };

    const handleStartExercise = (exercise) => {
        router.visit(route('exercises.show', exercise.id) + `?for_user_id=${client.id}`);
    };

    return (
        <section
            aria-labelledby="client-detail-heading"
            className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
        >
            <div aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>

            <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-[#F5F0FA]">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: '#7B5EA7' }}
                    aria-hidden="true"
                >
                    {getInitials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 id="client-detail-heading" className="text-lg font-bold text-gray-900 truncate">{client.name}</h2>
                    <p className="text-sm text-gray-500 truncate">{client.email}</p>
                </div>
                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] transition-colors"
                    aria-label="Sluit cliëntoverzicht"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div role="tablist" aria-label="Cliëntinformatie" className="flex border-b border-gray-200 px-4 pt-2 gap-1 overflow-x-auto">
                {TABS.map((tab, idx) => (
                    <button
                        key={tab.id}
                        ref={el => tabsRef.current[idx] = el}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={activeTab === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                        onClick={() => setActiveTab(tab.id)}
                        onKeyDown={(e) => handleTabKeyDown(e, idx)}
                        className={`shrink-0 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-inset ${
                            activeTab === tab.id
                                ? 'border-[#7B5EA7] text-[#7B5EA7] bg-[#F5F0FA]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="px-6 py-5">
                <div id="tabpanel-voortgang" role="tabpanel" aria-labelledby="tab-voortgang" hidden={activeTab !== 'voortgang'} tabIndex={0} className="focus:outline-none">
                    <p className="text-xs text-gray-400 mb-4">Overzicht van voltooide oefeningen. Gevoelsscores worden niet getoond.</p>
                    <TabVoortgang progress={progress} loading={dataLoading} />
                </div>

                <div id="tabpanel-favorieten" role="tabpanel" aria-labelledby="tab-favorieten" hidden={activeTab !== 'favorieten'} tabIndex={0} className="focus:outline-none">
                    <TabFavorieten favorites={favorites} loading={dataLoading} onToggle={handleToggleFavorite} toggling={toggling} />
                </div>

                <div id="tabpanel-oefeningen" role="tabpanel" aria-labelledby="tab-oefeningen" hidden={activeTab !== 'oefeningen'} tabIndex={0} className="focus:outline-none">
                    <TabOefeningen
                        clientId={client.id}
                        favorites={favorites}
                        loading={dataLoading}
                        onStartExercise={handleStartExercise}
                        onToggleFavorite={handleToggleFavorite}
                        toggling={toggling}
                    />
                </div>
            </div>
        </section>
    );
}
