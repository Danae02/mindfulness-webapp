import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import AccessibilityButton from '@/Components/AccessibilityButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Status kan komen als directe prop (ForgotPassword redirect)
    // of als flash.status (ResetPassword redirect via middleware)
    const successMessage = flash?.status || status;

    return (
        <GuestLayout>
            <Head title="Log in" />

            {successMessage && (
                <div
                    className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {successMessage}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mb-3 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Inloggen
                    </h1>
                </div>

                <div className="mb-3 flex justify-center">
                    <AccessibilityButton variant="button" />
                </div>

                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="email" value="E-mailadres" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full pl-10"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            aria-required="true"
                            placeholder="jouw@email.nl"
                        />
                    </div>

                    {errors.email && (
                        <InputError
                            message={errors.email}
                            className="mt-2"
                            role="alert"
                            aria-live="assertive"
                        />
                    )}
                </div>

                <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="password" value="Wachtwoord" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 pr-10"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            aria-required="true"
                            placeholder="••••••••••"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
                            aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                            aria-pressed={showPassword}
                        >
                            {showPassword ? (
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <InputError
                            message={errors.password}
                            className="mt-2"
                            role="alert"
                            aria-live="assertive"
                        />
                    )}
                </div>

                <div className="mt-2">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="inline-flex items-center gap-1.5 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2B4F] rounded-md px-2 py-1.5 hover:bg-gray-50 w-full sm:w-auto justify-center sm:justify-start"
                            style={{
                                color: '#0B2B4F',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                textDecorationThickness: '2px'
                            }}
                        >
                            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <span>Wachtwoord vergeten?</span>
                        </Link>
                    )}
                </div>

                <div className="mt-2 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            aria-describedby="remember-help"
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Onthoud mij
                        </span>
                    </label>
                    {/* Buiten de label: anders leest de screenreader de helptekst
                        als onderdeel van de labelnaam i.p.v. als beschrijving */}
                    <span id="remember-help" className="sr-only">
                        Volgende keer automatisch inloggen op deze computer
                    </span>
                </div>

                <div className="mt-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center py-2.5 text-base font-semibold bg-[#6c4092] hover:bg-[#5a337a] text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6c4092] focus:ring-offset-2 disabled:opacity-50"
                        aria-busy={processing}
                    >
                        {processing ? 'Bezig met inloggen...' : 'Inloggen'}
                    </button>
                </div>
            </form>

            <div className="mt-4 text-center">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-gray-400"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">
                            of
                        </span>
                    </div>
                </div>

                <div className="mt-3">
                    <Link
                        href={route('register')}
                        className="block w-full text-center py-2.5 px-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Account aanmaken
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
