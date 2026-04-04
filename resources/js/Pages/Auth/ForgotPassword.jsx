import { useState } from 'react';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import AccessibilityButton from '@/Components/AccessibilityButton';
import AudioButton from '@/Components/AudioButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    const audioFilePath = '/storage/audio/wachtwoord-vergeten-uitleg.mp3';

    return (
        <GuestLayout>
            <Head title="Wachtwoord vergeten" />

            <form onSubmit={submit}>
                <div className="flex justify-end mb-4">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark border border-primary rounded-full hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Terug naar inloggen
                    </Link>
                </div>

                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Wachtwoord vergeten?
                    </h1>
                    <h2 className="text-lg font-medium text-gray-600">
                        Reset je wachtwoord
                    </h2>
                </div>

                <div className="mb-4 flex justify-center">
                    <AccessibilityButton variant="button" />
                </div>

                <div className="mb-6 flex justify-center">
                    <AudioButton
                        audioFile={audioFilePath}
                        label="Lees voor"
                    />
                </div>

                <div className="mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p>
                        Vul je e-mailadres in. Je ontvangt dan een e-mail met een link om een nieuw wachtwoord aan te maken.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        Tip: Check je spam-map als je de e-mail niet hebt ontvangen.
                    </p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg">
                        {status}
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-mailadres
                        </label>
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht veld)</span>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full pl-10"
                            autoComplete="email"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            aria-required="true"
                            placeholder="jouw@email.nl"
                        />
                    </div>

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    <span className="text-red-600 font-bold" aria-hidden="true">*</span>
                    <span className="sr-only">Sterretje betekent: </span>
                    Verplicht veld
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center py-3 text-base font-semibold bg-[#6c4092] hover:bg-[#5a337a] text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6c4092] focus:ring-offset-2 disabled:opacity-50"
                    >
                        E-mail verzenden
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
