import { useState } from 'react';
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

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const togglePasswordConfirmationVisibility = () => {
        setShowPasswordConfirmation(!showPasswordConfirmation);
    };

    return (
        <GuestLayout>
            <Head title="Wachtwoord herstellen" />

            <form onSubmit={submit}>
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Nieuw wachtwoord
                    </h1>
                    <h2 className="text-lg font-medium text-gray-600">
                        Kies een sterk wachtwoord
                    </h2>
                </div>

                <div className="mb-6 flex justify-center">
                    <AccessibilityButton />
                </div>

                <input type="hidden" name="token" value={data.token} />
                <input type="hidden" name="email" value={data.email} />

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Wachtwoord herstellen voor:</span>{' '}
                        <span className="text-gray-800">{data.email}</span>
                    </p>
                </div>

                <div className="mt-4">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="password" value="Nieuw wachtwoord" />
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht veld)</span>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 pr-10"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            aria-required="true"
                            placeholder="Kies een sterk wachtwoord"
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center gap-1 mb-1">
                        <InputLabel htmlFor="password_confirmation" value="Herhaal wachtwoord" />
                        <span className="text-red-600 text-sm font-bold" aria-hidden="true">*</span>
                        <span className="sr-only">(verplicht veld)</span>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <TextInput
                            id="password_confirmation"
                            type={showPasswordConfirmation ? "text" : "password"}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full pl-10 pr-10"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            aria-required="true"
                            placeholder="Herhaal je wachtwoord"
                        />
                    </div>

                    <InputError message={errors.password_confirmation} className="mt-2" />
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
                        Wachtwoord herstellen
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
