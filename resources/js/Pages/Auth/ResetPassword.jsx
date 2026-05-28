import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import AccessibilityButton from '@/Components/AccessibilityButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Wachtwoord herstellen" />

            <form onSubmit={submit}>
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Nieuw wachtwoord
                    </h1>
                    <h2 className="text-lg font-medium text-gray-800">
                        Kies een sterk wachtwoord
                    </h2>
                </div>

                <div className="mb-6 flex justify-center">
                    <AccessibilityButton variant="button"/>
                </div>

                <input type="hidden" name="token" value={data.token}/>
                <input type="hidden" name="email" value={data.email}/>

                {errors.email && (
                    <div
                        className="mb-4 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg"
                        role="alert"
                        aria-live="assertive"
                    >
                        <span className="sr-only">Fout: </span>
                        {errors.email}
                    </div>
                )}

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800">
                        <span className="font-medium">Wachtwoord herstellen voor:</span>{' '}
                        <span className="text-gray-800">{data.email}</span>
                    </p>
                </div>

                {/* Nieuw wachtwoord */}
                <div className="mt-4">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="password" value="Nieuw wachtwoord"/>
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht veld)</span>
                    </div>

                    <span id="new-password-hint" className="sr-only">
                        Kies een sterk nieuw wachtwoord
                    </span>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 border-gray-500"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            aria-required="true"
                            aria-invalid={errors.password ? 'true' : undefined}
                            aria-describedby={
                                ['new-password-hint', errors.password ? 'new-password-error' : null]
                                    .filter(Boolean).join(' ')
                            }
                        />
                    </div>

                    {errors.password && (
                        <InputError
                            id="new-password-error"
                            message={errors.password}
                            className="mt-2"
                            role="alert"
                        />
                    )}
                </div>

                {/* Herhaal wachtwoord */}
                <div className="mt-4">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="password_confirmation" value="Herhaal wachtwoord"/>
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht veld)</span>
                    </div>

                    <span id="new-password-confirm-hint" className="sr-only">
                        Voer hetzelfde wachtwoord nogmaals in
                    </span>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd"
                                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                      clipRule="evenodd"/>
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
                                ['new-password-confirm-hint', errors.password_confirmation ? 'new-password-confirmation-error' : null]
                                    .filter(Boolean).join(' ')
                            }
                        />
                    </div>

                    {errors.password_confirmation && (
                        <InputError
                            id="new-password-confirmation-error"
                            message={errors.password_confirmation}
                            className="mt-2"
                            role="alert"
                        />
                    )}
                </div>

                <div className="mt-4 text-sm text-gray-700">
                    <span className="text-red-600 font-bold" aria-hidden="true">*</span>
                    <span className="sr-only">Sterretje betekent: </span>
                    Verplicht veld
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center py-3 text-base font-semibold bg-[#6c4092] hover:bg-[#5a337a] text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6c4092] focus:ring-offset-2 disabled:opacity-50"
                        aria-busy={processing}
                    >
                        {processing ? 'Bezig met herstellen...' : 'Wachtwoord herstellen'}
                    </button>
                </div>

                <div className="mt-4">
                    <Link
                        href={route('login')}
                        className="block w-full text-center py-3 px-4 border-2 border-[#6c4092] text-[#6c4092] font-semibold rounded-lg hover:bg-[#6c4092] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6c4092] focus:ring-offset-2"
                        aria-label="Terug naar de inlogpagina"
                    >
                        Terug naar inloggen
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
