import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AddClientForm({ onSuccess, onCancel }) {
    const [form,       setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [errors,     setErrors]     = useState({});
    const [submitting, setSubmitting] = useState(false);
    const firstInputRef = useRef(null);

    useEffect(() => { firstInputRef.current?.focus(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        try {
            await axios.post(route('registerbysupervisor'), form);
            onSuccess?.();
        } catch (err) {
            setErrors(err.response?.data?.errors ?? { general: ['Er is een fout opgetreden.'] });
        } finally {
            setSubmitting(false);
        }
    };

    const field = (id, label, type = 'text') => (
        <div>
            <label htmlFor={`add-client-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={`add-client-${id}`}
                ref={id === 'name' ? firstInputRef : undefined}
                type={type}
                value={form[id]}
                onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                required
                autoComplete={type === 'password' ? 'new-password' : id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:border-transparent"
                aria-describedby={errors[id] ? `add-client-${id}-error` : undefined}
                aria-invalid={!!errors[id]}
            />
            {errors[id] && (
                <p id={`add-client-${id}-error`} className="text-xs text-red-600 mt-1" role="alert">
                    {errors[id][0]}
                </p>
            )}
        </div>
    );

    return (
        <section aria-labelledby="add-client-heading" className="border border-[#D4C5E8] rounded-xl p-6 bg-[#F5F0FA] mt-4">
            <h3 id="add-client-heading" className="text-base font-semibold text-gray-800 mb-4">Nieuwe cliënt toevoegen</h3>
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                    {field('name', 'Naam')}
                    {field('email', 'E-mailadres', 'email')}
                    {field('password', 'Wachtwoord', 'password')}
                    {field('password_confirmation', 'Wachtwoord bevestigen', 'password')}
                </div>
                {errors.general && (
                    <p className="text-sm text-red-600 mt-3" role="alert">{errors.general[0]}</p>
                )}
                <div className="flex gap-3 mt-5">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                        style={{ backgroundColor: '#7B5EA7' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6a4e8e'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B5EA7'}
                    >
                        {submitting ? 'Opslaan…' : 'Cliënt toevoegen'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
                    >
                        Annuleren
                    </button>
                </div>
            </form>
        </section>
    );
}
