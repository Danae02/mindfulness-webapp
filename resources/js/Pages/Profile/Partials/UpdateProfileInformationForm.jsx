import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
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
        <form onSubmit={submit} className="space-y-5">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Naam
                </label>

                <TextInput
                    id="name"
                    className="mt-1 block w-full"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    isFocused
                    autoComplete="name"
                    aria-required="true"
                    aria-label="Naam"
                />

                <InputError className="mt-2" message={errors.name} />
            </div>

            {/* E-mailadres veld */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mailadres
                </label>
                <TextInput
                    id="email"
                    type="email"
                    className="mt-1 block w-full"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                    aria-required="true"
                    aria-label="E-mailadres"
                />
                <InputError className="mt-2" message={errors.email} />
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div>
                    <p className="mt-2 text-sm text-gray-800">
                        Je e-mailadres is niet geverifieerd.
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="rounded-md text-sm text-indigo-600 underline hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-1"
                        >
                            Klik hier om de verificatie-e-mail opnieuw te verzenden.
                        </Link>
                    </p>

                    {status === 'verification-link-sent' && (
                        <div className="mt-2 text-sm font-medium text-green-600">
                            Een nieuwe verificatielink is verzonden naar je e-mailadres.
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 pt-2">
                <PrimaryButton disabled={processing}>Opslaan</PrimaryButton>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-green-600">
                        Opgeslagen.git push origin main
                    </p>
                </Transition>
            </div>
        </form>
    );
}
