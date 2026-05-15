import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import EyeIcon from "@/Icons/EyeIcon.jsx";
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={updatePassword} className="space-y-5" noValidate>

            {/*Huidige wachtwoord */}
            <div>
                <label
                    htmlFor="current_password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Huidige wachtwoord
                </label>

                <div className="relative">
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="mt-1 block w-full pr-10"
                        autoComplete="current-password"
                        aria-required="true"
                        aria-invalid={errors.current_password ? 'true' : undefined}
                        aria-describedby={
                            errors.current_password
                                ? 'current-password-error'
                                : undefined
                        }
                    />

                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7B5EA7] rounded-r-lg"
                        aria-label={
                            showCurrentPassword
                                ? 'Verberg huidig wachtwoord'
                                : 'Toon huidig wachtwoord'
                        }
                        aria-pressed={showCurrentPassword}
                    >
                        <EyeIcon isOpen={showCurrentPassword} />
                    </button>
                </div>

                <InputError
                    id="current-password-error"
                    message={errors.current_password}
                    className="mt-2"
                    role="alert"
                    aria-live="assertive"
                />
            </div>

            {/* Nieuw wachtwoord */}
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Nieuw wachtwoord
                </label>

                <div className="relative">
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type={showNewPassword ? 'text' : 'password'}
                        className="mt-1 block w-full pr-10"
                        autoComplete="new-password"
                        aria-required="true"
                        aria-invalid={errors.password ? 'true' : undefined}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7B5EA7] rounded-r-lg"
                        aria-label={
                            showNewPassword
                                ? 'Verberg nieuw wachtwoord'
                                : 'Toon nieuw wachtwoord'
                        }
                        aria-pressed={showNewPassword}
                    >
                        <EyeIcon isOpen={showNewPassword} />
                    </button>
                </div>
                <InputError
                    id="password-error"
                    message={errors.password}
                    className="mt-2"
                    role="alert"
                    aria-live="assertive"
                />
            </div>

            {/*Herhaal nieuw wachtwoord */}
            <div>
                <label
                    htmlFor="password_confirmation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Herhaal nieuw wachtwoord
                </label>

                <div className="relative">
                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="mt-1 block w-full pr-10"
                        autoComplete="new-password"
                        aria-required="true"
                        aria-invalid={
                            errors.password_confirmation ? 'true' : undefined
                        }
                        aria-describedby={
                            errors.password_confirmation
                                ? 'password-confirmation-error'
                                : undefined
                        }
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7B5EA7] rounded-r-lg"
                        aria-label={
                            showConfirmPassword
                                ? 'Verberg herhaling wachtwoord'
                                : 'Toon herhaling wachtwoord'
                        }
                        aria-pressed={showConfirmPassword}
                    >
                        <EyeIcon isOpen={showConfirmPassword} />
                    </button>
                </div>
                <InputError
                    id="password-confirmation-error"
                    message={errors.password_confirmation}
                    className="mt-2"
                    role="alert"
                    aria-live="assertive"
                />
            </div>

            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    disabled={processing}
                    aria-disabled={processing}
                    className="px-4 py-3 bg-[#7B5EA7] text-white font-semibold rounded-lg shadow
                               hover:bg-[#6a4e8e]
                               focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2
                               transition-colors disabled:opacity-50
                               min-h-[44px] min-w-[44px]"
                >
                    {processing ? 'Opslaan…' : 'Opslaan'}
                </button>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p
                        role="status"
                        aria-live="polite"
                        className="text-sm text-green-600"
                    >
                        Opgeslagen.
                    </p>
                </Transition>
            </div>
        </form>
    );
}
