import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="Mijn profiel" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">

                    <div>
                        <h1 className="text-2xl font-bold text-darkGray">Mijn profiel</h1>
                        <p className="text-gray-500 mt-1">
                            Pas hier je naam, e-mailadres en wachtwoord aan.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-darkGray">Profiel gegevens</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Verander hier je naam en e-mailadres.
                            </p>
                        </div>
                        <div className="px-6 py-5">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-darkGray">Wachtwoord wijzigen</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Kies een nieuw wachtwoord dat minstens 8 tekens lang, een hoofdletter heeft én een getal bevat.
                            </p>
                        </div>
                        <div className="px-6 py-5">
                            <UpdatePasswordForm />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
