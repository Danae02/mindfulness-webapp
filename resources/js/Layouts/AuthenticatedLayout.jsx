import { useEffect, useRef } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';


export default function AuthenticatedLayout({ header, children, topBar }) {
    const user = usePage().props.auth.user;
    const mainRef = useRef(null);

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.focus();
            window.scrollTo(0, 0);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Skip to content link voor screenreaders */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                    focus:bg-[#7B5EA7] focus:text-white focus:px-4 focus:py-2 focus:rounded
                    focus:z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
                Ga naar hoofdinhoud
            </a>

            {/* Navigatiebalk */}
            <nav
                className="bg-white border-b border-gray-200"
                aria-label="Hoofdnavigatie"
                role="navigation"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo - Home link */}
                        <div className="flex shrink-0 items-center">
                            <Link
                                href={route('dashboard')}
                                className="focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 rounded"
                                aria-label="Affect-us, ga naar dashboard"
                            >
                                <ApplicationLogo
                                    className="block h-12 w-auto fill-current text-gray-800"
                                    aria-hidden="true"
                                    focusable="false"
                                />
                                <span className="sr-only">Affect-us</span>
                            </Link>
                        </div>

                        {/* Rechter menu */}
                        <div className="flex items-center gap-3" role="group" aria-label="Gebruikersmenu">
                            {/* Profiel link */}
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-2 px-3 py-2 rounded-full border-2
                                    transition-colors duration-200
                                    focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2
                                    hover:bg-purple-50"
                                style={{
                                    backgroundColor: '#F0E8FF',
                                    borderColor: '#7B5EA7'
                                }}
                                aria-label={`Profiel van ${user.name}`}
                            >
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                    role="presentation"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-800" aria-hidden="true">
                                    {user.name}
                                </span>
                            </Link>

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
                                    role="presentation"
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
            <main
                id="main-content"
                role="main"
                tabIndex={-1}
                ref={mainRef}
                className="focus:outline-none"
            >

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
