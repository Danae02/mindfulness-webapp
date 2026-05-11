import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import AccessibilityButton from '@/Components/AccessibilityButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const [resendClicked, setResendClicked] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setResendClicked(true);
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="E-mail verificatie" />

            <div className="flex justify-end mb-4">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 border-2 border-red-300 rounded-full hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Uitloggen
                </Link>
            </div>

            <form onSubmit={submit}>
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Verifieer je e-mailadres
                    </h1>
                    <h2 className="text-lg font-medium text-gray-600">
                        Nog één stap en dan ben je klaar
                    </h2>
                </div>

                <div className="mb-6 flex justify-center">
                    <AccessibilityButton variant="button" />
                </div>

                <div className="mb-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>
                            Bedankt voor het aanmelden! Voordat je verder kunt, moet je je e-mailadres verifiëren.
                            We hebben een verificatielink gestuurd naar het e-mailadres dat je hebt opgegeven.
                        </span>
                    </p>
                    <p className="mt-3 text-xs text-gray-700">
                        Tip: Check je spam-map als je de e-mail niet hebt ontvangen.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 text-sm font-medium text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Een nieuwe verificatielink is verzonden naar het e-mailadres dat je hebt opgegeven.
                        </span>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center py-3 text-base font-semibold bg-[#6c4092] hover:bg-[#5a337a] text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6c4092] focus:ring-offset-2 disabled:opacity-50"
                    >
                        {resendClicked ? "Verificatielink opnieuw verzonden" : "Verificatielink opnieuw verzenden"}
                    </button>
                </div>

                <p className="mt-4 text-center text-xs text-gray-700">
                    Geen e-mail ontvangen? Klik op de knop hierboven om een nieuwe link aan te vragen.
                </p>
            </form>
        </GuestLayout>
    );
}
