import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

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
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <div className={`border-2 border-red-600 rounded-xl overflow-hidden ${className}`}>
            <div className="px-6 py-5">
                <h2 className="text-lg font-semibold text-red-800">Account verwijderen</h2>
                <p className="text-sm text-red-600 mt-0.5">
                    Als je je account verwijdert, worden al de gegevens permanent gewist. Dit kan niet ongedaan worden gemaakt.
                    Zorg dat je eerst alles hebt opgeslagen wat je wil bewaren.
                </p>
            </div>

            <div className="px-6 py-5 bg-white">
                <DangerButton onClick={confirmUserDeletion}>
                    Account verwijderen
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Weet je zeker dat je je account wilt verwijderen?
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Als je je account verwijdert, worden al je gegevens permanent gewist.
                        Dit kan niet ongedaan worden gemaakt. Voer je wachtwoord in om te bevestigen.
                    </p>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full"
                            isFocused
                            placeholder="Wachtwoord"
                            aria-required="true"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Annuleren
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            Account verwijderen
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
