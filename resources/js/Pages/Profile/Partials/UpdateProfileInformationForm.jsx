import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
                                                     mustVerifyEmail,
                                                     status,
                                                     className = '',
                                                 }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>

            <div>
                <label
                    htmlFor="profile-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Naam
                </label>

                <TextInput
                    id="profile-name"
                    className="mt-1 block w-full border-gray-500"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    isFocused
                    autoComplete="name"
                    aria-required="true"
                    aria-label="Naam"
                    aria-invalid={errors.name ? 'true' : undefined}
                    aria-describedby={errors.name ? 'profile-name-error' : undefined}
                />

                <InputError
                    id="profile-name-error"
                    className="mt-2"
                    message={errors.name}
                    role="alert"
                    aria-live="assertive"
                />
            </div>

            <div>
                <label
                    htmlFor="profile-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    E-mailadres
                </label>
                <TextInput
                    id="profile-email"
                    type="email"
                    className="mt-1 block w-full border-gray-500"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={errors.email ? 'true' : undefined}
                    aria-describedby={errors.email ? 'profile-email-error' : undefined}
                />
                <InputError
                    id="profile-email-error"
                    className="mt-2"
                    message={errors.email}
                    role="alert"
                    aria-live="assertive"
                />
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div role="status" aria-live="polite">
                    <p className="mt-2 text-sm text-gray-800">
                        Je e-mailadres is niet geverifieerd.{' '}

                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="rounded-md text-sm text-indigo-600 underline hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-1"
                        >
                            Verificatie-e-mail opnieuw verzenden.
                        </Link>
                    </p>

                    {status === 'verification-link-sent' && (

                        <p
                            role="status"
                            aria-live="polite"
                            className="mt-2 text-sm font-medium text-green-600"
                        >
                            Een nieuwe verificatielink is verzonden naar je e-mailadres.
                        </p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    disabled={processing}
                    aria-disabled={processing}
                    className="px-4 py-3 bg-[#6C4092] text-white font-semibold rounded-lg shadow
                               hover:bg-[#5a3678]
                               focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-2
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
