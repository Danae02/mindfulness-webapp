import { useEffect, useRef } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage, router } from '@inertiajs/react';


export default function AuthenticatedLayout({ header, children, topBar, announcePageLoad = true }) {
    const user = usePage().props.auth.user;
    const { url } = usePage();
    const announceRef = useRef(null);
    const skipLinkRef = useRef(null);

    useEffect(() => {
        if (!announcePageLoad) return;
        const title = document.title || 'Pagina geladen';
        if (announceRef.current) {
            announceRef.current.textContent = '';
            setTimeout(() => {
                announceRef.current.textContent = `${title} is geladen`;
            }, 100);
        }
    }, [url, announcePageLoad]);

    // na het laatste focusbare element op de pagina springt Tab terug naar de skiplink
    useEffect(() => {
        const focusableSelectors =
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab' || e.shiftKey) return;

            // Niet ingrijpen als er een modal/dialog open is
            if (document.querySelector('[role="dialog"]')) return;

            const focusable = Array.from(document.querySelectorAll(focusableSelectors))
                .filter(el => el.offsetParent !== null || el === document.activeElement);

            const last = focusable[focusable.length - 1];

            if (document.activeElement === last && skipLinkRef.current) {
                e.preventDefault();
                skipLinkRef.current.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [url]);

    return (
        <div className="min-h-screen bg-gray-100">

            <p
                ref={announceRef}
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
            />

            <button
                ref={skipLinkRef}
                onClick={() => {
                    const main = document.getElementById('main-content');
                    if (main) {
                        main.setAttribute('tabindex', '-1');
                        main.focus();
                    }
                }}
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                    focus:bg-[#7B5EA7] focus:text-white focus:px-4 focus:py-2 focus:rounded
                    focus:z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
                Ga naar hoofdinhoud
            </button>

            {/* Navigatiebalk */}
            <nav className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo - Home link */}
                        <div className="flex shrink-0 items-center">
                            <Link
                                href={route('dashboard')}
                                className="focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 rounded"
                                aria-label="Ga terug naar dashboard"
                            >
                                <ApplicationLogo
                                    className="block h-12 w-auto fill-current text-gray-800"
                                />
                            </Link>
                        </div>

                        {/* Rechter menu */}
                        <div className="flex items-center gap-3">
                            {/* Profiel knop */}
                            <button
                                onClick={() => router.visit(route('profile.edit'))}
                                className="flex items-center gap-2 px-3 py-2 rounded-full border-2
                                    transition-colors duration-200
                                    focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2
                                    hover:bg-purple-50"
                                style={{
                                    backgroundColor: '#F0E8FF',
                                    borderColor: '#7B5EA7'
                                }}
                                aria-label={`Ga naar profiel van ${user.name}`}
                            >
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-800" aria-hidden="true">
                                    {user.name}
                                </span>
                            </button>

                            {/* Logout button */}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex items-center gap-2 px-3 py-2 rounded-full border-2
                                    transition-colors duration-200
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C0392B]
                                    hover:bg-red-50"
                                style={{
                                    backgroundColor: 'transparent',
                                    borderColor: '#C0392B',
                                    color: '#C0392B'
                                }}
                                aria-label="Uitloggen uit je account"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{color: '#C0392B'}}
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                <span className="text-sm font-medium" style={{color: '#C0392B'}}>
                                    Uitloggen
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {topBar && topBar}

            {/* hoofdcontent */}
            <main id="main-content" role="main" className="focus:outline-none">
                <p className="sr-only">Hoofdinhoud van de pagina</p>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {header && (
                        <header className="mb-6">
                            {header}
                        </header>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
