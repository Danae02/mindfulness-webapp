import { router } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import AudioControl from "@/Components/AudioControl.jsx";

export default function IntroExercisePage({ exercise }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {exercise.exercise_name}
                </h2>
            }
        >
            <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-hidden">

                    {/* Paarse header */}
                    <div className="px-8 py-6 text-center" style={{ backgroundColor: '#7B5EA7' }}>
                        <h1 className="text-2xl font-bold text-white">{exercise.exercise_name}</h1>
                    </div>

                    <div className="p-8 space-y-6">

                        {/* Uitleg */}
                        <div
                            className="p-5 rounded-xl border-2"
                            style={{ backgroundColor: '#F0E8FF', borderColor: '#5F5F5F' }}
                        >
                            <p className="text-gray-700 text-sm leading-relaxed">
                                Welkom! Luister deze introductie om te leren waarom mindfulness oefenen werkt.
                                <p className="sr-only">Afspeelknop voor de oefening</p>
                                Druk op de afspeelknop om te starten.
                            </p>
                        </div>

                        {/* Audiospeler */}
                        <div className="p-6 rounded-xl border-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#7B5EA7' }}>
                            <AudioControl AudioName={exercise.audio_file_path} />
                        </div>

                        {/* Terug-knop */}
                        <button
                            onClick={() => router.visit('/dashboard')}
                            className="w-full py-3 px-4 bg-[#7B5EA7] text-white font-semibold rounded-xl shadow hover:bg-[#6a4e8e] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            Terug naar dashboard
                        </button>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
