import { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import AccessibilityButton from '@/Components/AccessibilityButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const firstErrorRef = useRef(null);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });

        // Als er fouten zijn, focus op het eerste veld met een fout
        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            const element = document.querySelector(`input[name="${firstErrorField}"]`);
            if (element) {
                element.focus();
                element.setAttribute('aria-invalid', 'true');
            }
        }
    };

    return (
        <GuestLayout>
            <Head title="Registreren" />
            <form
                onSubmit={submit}
                aria-label="Registratieformulier voor nieuw account"
            >
                <div className="mb-3 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Account aanmaken pagina
                    </h1>
                    <h2 className="text-base font-medium text-gray-800">
                        Als nieuwe gebruiker kan je hier jouw account aanmaken
                    </h2>
                </div>

                <div className="mb-3 flex justify-center">
                    <AccessibilityButton variant="button" />
                </div>

                {/* Voornaam */}
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="name" value="Voornaam" />
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht)</span>
                    </div>

                    <span id="name-hint" className="sr-only">
                        Voornaam invoerveld
                    </span>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>

                        <TextInput
                            id="name"
                            name="name"
                            type="text"
                            value={data.name}
                            className="mt-1 block w-full pl-10 border-gray-500"
                            autoComplete="given-name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            aria-required="true"
                            aria-invalid={errors.name ? 'true' : undefined}
                            aria-describedby={
                                ['name-hint', errors.name ? 'name-error' : null]
                                    .filter(Boolean).join(' ')
                            }
                            placeholder="Jouw voornaam"
                        />
                    </div>

                    {errors.name && (
                        <InputError
                            id="name-error"
                            message={errors.name}
                            className="mt-2"
                            role="alert"
                        />
                    )}
                </div>

                {/* E-mailadres veld*/}
                <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="email" value="E-mailadres" />
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht)</span>
                    </div>

                    <span id="register-email-hint" className="sr-only">
                        E-mailadres invoerveld
                    </span>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full pl-10 border-gray-500"
                            autoComplete="email"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            aria-required="true"
                            aria-invalid={errors.email ? 'true' : undefined}
                            aria-describedby={
                                ['register-email-hint', errors.email ? 'email-error' : null]
                                    .filter(Boolean).join(' ')
                            }
                            placeholder="jouw@email.nl"
                        />
                    </div>

                    {errors.email && (
                        <InputError
                            id="email-error"
                            message={errors.email}
                            className="mt-2"
                            role="alert"
                        />
                    )}
                </div>

                {/* Wachtwoord */}
                <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="password" value="Wachtwoord" />
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht)</span>
                    </div>

                    <span id="password-hint" className="sr-only">
                        Wachtwoord invoerveld
                    </span>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 border-gray-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            aria-required="true"
                            aria-invalid={errors.password ? 'true' : undefined}
                            aria-describedby={
                                ['password-hint', errors.password ? 'password-error' : null]
                                    .filter(Boolean).join(' ')
                            }
                            placeholder="Jouw wachtwoord"
                        />
                    </div>

                    {errors.password && (
                        <InputError
                            id="password-error"
                            message={errors.password}
                            className="mt-2"
                            role="alert"
                        />
                    )}
                </div>

                {/* Herhaal wachtwoord */}
                <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="password_confirmation" value="Herhaal wachtwoord" />
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht)</span>
                    </div>

                    <span id="password-confirm-hint" className="sr-only">
                        Wachtwoord bevestiging invoerveld
                    </span>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full pl-10 border-gray-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            aria-required="true"
                            aria-invalid={errors.password_confirmation ? 'true' : undefined}
                            aria-describedby={
                                ['password-confirm-hint', errors.password_confirmation ? 'password-confirmation-error' : null]
                                    .filter(Boolean).join(' ')
                            }
                            placeholder="Herhaal jouw wachtwoord"
                        />
                    </div>

                    {errors.password_confirmation && (
                        <InputError
                            id="password-confirmation-error"
                            message={errors.password_confirmation}
                            className="mt-2"
                            role="alert"
                        />
                    )}
                </div>

                <div className="mt-2 text-sm text-gray-700">
                    <span className="text-red-600 font-bold" aria-hidden="true">*</span>
                    <span className="sr-only">Sterretje betekent: </span>
                    Verplicht veld
                </div>

                <div className="mt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center py-2.5 text-base font-semibold bg-[#6c4092] hover:bg-[#5a337a] text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6c4092] focus:ring-offset-2 disabled:opacity-50"
                        aria-busy={processing}
                    >
                        {processing ? 'Bezig met aanmaken...' : 'Account aanmaken'}
                    </button>
                </div>
            </form>

            <div className="mt-4 text-center">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-gray-400"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-700 font-medium">
                            of
                        </span>
                    </div>
                </div>

                <div className="mt-3">
                    <Link
                        href={route('login')}
                        className="block w-full text-center py-2.5 px-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Inloggen met bestaand account
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
