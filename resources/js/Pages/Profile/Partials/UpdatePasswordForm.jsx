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

    const toggleCurrentPassword = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    return (
        <form onSubmit={updatePassword} className="space-y-5">

            {/* Huidige wachtwoord */}
            <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Huidige wachtwoord
                </label>

                <div className="relative">
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type={showCurrentPassword ? "text" : "password"}
                        className="mt-1 block w-full pr-10"
                        autoComplete="current-password"
                        aria-required="true"
                        aria-label="Huidige wachtwoord"
                    />
                    <button
                        type="button"
                        onClick={toggleCurrentPassword}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
                        aria-label={showCurrentPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    >
                        <EyeIcon isOpen={showCurrentPassword} />
                    </button>
                </div>
                <InputError message={errors.current_password} className="mt-2" />
            </div>

            {/* Nieuw wachtwoord */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Nieuw wachtwoord
                </label>

                <TextInput
                    id="password"
                    ref={passwordInput}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    type="password"
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-label="Nieuw wachtwoord"
                />
                <InputError message={errors.password} className="mt-2" />
            </div>

            {/* Herhaal nieuw wachtwoord*/}
            <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Herhaal nieuw wachtwoord
                </label>

                <TextInput
                    id="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    type="password"
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-label="Herhaal nieuw wachtwoord"
                />
                <InputError message={errors.password_confirmation} className="mt-2" />
            </div>

            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-[#7B5EA7] text-white font-semibold rounded-lg shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                    Opslaan
                </button>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-green-600">
                        Opgeslagen.
                    </p>
                </Transition>
            </div>
        </form>
    );
}
