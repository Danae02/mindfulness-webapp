import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AudioButton from '@/Components/AudioButton';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import WarningIcon from "@/Icons/WarningIcon.jsx";

const audioFilePath = '/storage/audio/ElevenLabs_instructie_verwijderAccount.mp3';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({ password: '' });

    const confirmUserDeletion = () => setConfirmingUserDeletion(true);

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError:   () => passwordInput.current.focus(),
            onFinish:  () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <div className={`border-2 border-red-600 rounded-xl overflow-hidden ${className}`}>
            <div className="px-6 py-5 bg-red-50">
                <h2 className="text-lg font-semibold text-red-800">Account verwijderen</h2>
                <p className="text-sm text-red-600 mt-0.5">
                    Als je je account verwijdert, worden al je gegevens permanent gewist.
                    Dit kan niet ongedaan worden gemaakt.
                </p>
            </div>

            <div className="px-6 py-5 bg-white">
                <DangerButton
                    onClick={confirmUserDeletion}
                    aria-label="Account verwijderen — opent een bevestigingsvenster"
                >
                    Account verwijderen
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 flex flex-col items-center text-center">

                    <WarningIcon className="mb-4" />

                    {/* Lees voor knop */}
                    <div className="mb-4">
                        <AudioButton
                            audioFile={audioFilePath}
                            label="Lees voor"
                            aria-label="Lees de waarschuwingstekst voor"
                        />
                    </div>

                    {/* Titel */}
                    <h2
                        id="delete-modal-title"
                        className="text-2xl font-bold text-gray-900 mb-3"
                    >
                        Weet je het zeker?
                    </h2>

                    {/* Beschrijving */}
                    <p className="text-base text-gray-700 mb-6 max-w-sm" aria-live="polite">
                        Je staat op het punt om je account te verwijderen.
                        Al je gegevens worden voor altijd verwijderd.
                        Dit kan <strong>niet</strong> worden teruggedraaid.
                    </p>

                    {/* Wachtwoordveld */}
                    <div className="w-full text-left mb-6">
                        <InputLabel
                            htmlFor="password"
                            value="Vul hier je wachtwoord in om je account te verwijderen:"
                            className="block text-sm font-semibold text-gray-800 mb-2"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full text-base px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-300"
                            isFocused
                            placeholder="Jouw wachtwoord"
                            aria-required="true"
                            aria-describedby={errors.password ? "password-error" : undefined}
                            autoComplete="current-password"
                        />
                        <InputError
                            id="password-error"
                            message={errors.password}
                            className="mt-2"
                            aria-live="assertive"
                        />
                    </div>

                    {/* Knoppen */}
                    <div className="w-full flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 text-base font-bold text-white rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-60"
                            style={{ backgroundColor: '#C0392B' }}
                            aria-label="Bevestig: verwijder mijn account definitief"
                        >
                            {processing ? 'Bezig met verwijderen…' : 'Ja, verwijder mijn account'}
                        </button>

                        <button
                            type="button"
                            onClick={closeModal}
                            className="w-full py-4 text-base font-semibold text-gray-800 bg-white border-2 border-gray-400 rounded-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
                            aria-label="Annuleren — ga terug zonder je account te verwijderen"
                        >
                            Nee, ga terug
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
