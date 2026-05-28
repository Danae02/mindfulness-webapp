import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="Mijn profiel instellingen" />

            <main id="main-content" tabIndex={-1}>
                <div className="py-6 sm:py-12">
                    <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">

                        <div className="space-y-2 sm:space-y-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-darkGray">Mijn profiel</h1>
                            <p className="text-gray-700">
                                Pas hier je naam, e-mailadres en wachtwoord aan.
                            </p>
                        </div>

                        <section
                            aria-labelledby="section-profile-heading"
                            className="bg-white rounded-xl shadow-card border border-black overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-gray-500">
                                <h2
                                    id="section-profile-heading"
                                    className="text-lg font-semibold text-darkGray"
                                >
                                    Profiel gegevens
                                </h2>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    Verander hier je naam en e-mailadres.
                                </p>
                            </div>
                            <div className="px-6 py-5">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        </section>

                        <section
                            aria-labelledby="section-password-heading"
                            className="bg-white rounded-xl shadow-card border border-black overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-gray-500">
                                <h2
                                    id="section-password-heading"
                                    className="text-lg font-semibold text-darkGray"
                                >
                                    Wachtwoord wijzigen
                                </h2>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    Kies een nieuw wachtwoord dat minstens 8 tekens lang is,
                                    een hoofdletter heeft én een getal bevat.
                                </p>
                            </div>
                            <div className="px-6 py-5">
                                <UpdatePasswordForm />
                            </div>
                        </section>
                        <section aria-labelledby="section-delete-heading">
                            <h2 id="section-delete-heading" className="sr-only">
                                Account verwijderen
                            </h2>
                            <DeleteUserForm />
                        </section>

                        {/* Contact */}
                        <p className="text-sm text-gray-800 pb-4">
                            <a
                                href="mailto:info@affect-us.nl"
                                aria-label="Zijn er vragen of opmerkingen? Neem dan contact op via info@affect-us.nl"
                                className="underline underline-offset-2 decoration-2 focus:outline-none focus:ring-2 focus:ring-[#0B2B4F] focus:ring-offset-2 rounded"
                                style={{ color: 'inherit' }}
                            >
                                <span aria-hidden="true">
                                    Zijn er vragen of opmerkingen? Neem dan contact op via{' '}
                                    <span className="font-semibold text-[#0B2B4F]">info@affect-us.nl</span>
                                </span>
                            </a>
                        </p>

                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
