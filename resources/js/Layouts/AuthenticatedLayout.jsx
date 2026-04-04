import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function AuthenticatedLayout({ header, children, topBar }) {
    const user = usePage().props.auth.user;
    const profileButtonRef = useRef(null);
    const logoutButtonRef = useRef(null);

    // Toegankelijk voor toetsenbordgebruikers
    useEffect(() => {
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigatiebalk */}
            <nav className="bg-white border-b border-gray-200" aria-label="Hoofdnavigatie">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo */}
                        <div className="flex shrink-0 items-center">
                            <Link
                                href={route('dashboard')}
                                aria-label="Ga naar dashboard"
                                tabIndex={0}
                                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                            >
                                <ApplicationLogo className="block h-12 w-auto fill-current text-gray-800" aria-hidden="true" />
                                <span className="sr-only">Dashboard</span>
                            </Link>
                        </div>

                        {/* Rechter menu */}
                        <div className="flex items-center gap-3">
                            <Link
                                ref={profileButtonRef}
                                href={route('profile.edit')}
                                tabIndex={0}
                                className="flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:bg-gray-50"
                                style={{
                                    backgroundColor: '#F0E8FF',
                                    borderColor: '#000000'
                                }}
                                aria-label="Mijn profiel"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-800">
                                    {user.name}
                                </span>
                            </Link>

                            <Link
                                ref={logoutButtonRef}
                                href={route('logout')}
                                method="post"
                                as="button"
                                tabIndex={0}
                                className="flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C0392B] focus:bg-red-50"
                                style={{
                                    backgroundColor: 'transparent',
                                    borderColor: '#C0392B',
                                    color: '#C0392B'
                                }}
                                aria-label="Uitloggen"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#C0392B'}} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
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

            <main>
                {/*{header && (*/}
                {/*    <header className="bg-white shadow">*/}
                {/*        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">*/}
                {/*            {header}*/}
                {/*        </div>*/}
                {/*    </header>*/}
                {/*)}*/}
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
