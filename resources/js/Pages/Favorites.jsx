import { useEffect, useState } from "react";
import axios from "axios";
import { Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(route('favorites.index'));
            setFavorites(response.data);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (exerciseId) => {
        try {
            await axios.post(route('favorites.toggle'), { exercise_id: exerciseId });
            // Verwijder uit de lijst
            setFavorites(favorites.filter(f => f.id !== exerciseId));
        } catch (error) {
            console.error("Failed to remove favorite:", error);
        }
    };

    const handleBack = () => {
        router.visit('/dashboard');
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <Head title="Mijn favorieten" />
                <div className="text-center py-12">
                    <p>Laden...</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Mijn favorieten" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-darkGray mb-2">Mijn favorieten</h1>
                <p className="text-gray-500 mb-8">
                    Hier vind je al je favoriete oefeningen die je hebt opgeslagen.
                </p>

                {favorites.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-card border border-gray-200">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg">Je hebt nog geen favoriete oefeningen</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Klik op het hartje bij een oefening om hem toe te voegen
                        </p>
                        <Link
                            href={route('dashboard')}
                            className="inline-block mt-6 px-6 py-2 bg-[#7B5EA7] text-white rounded-lg hover:bg-[#6a4e8e] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
                        >
                            Ga terug naar oefeningen
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {favorites.map((exercise) => (
                                <article
                                    key={exercise.id}
                                    className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                                >
                                    <div className="p-5">
                                        <div className="mb-3">
                                            <h2 className="text-lg font-bold text-darkGray">
                                                {exercise.exercise_name}
                                            </h2>
                                        </div>

                                        {exercise.course_name && (
                                            <p className="text-sm text-gray-500 mb-2">
                                                Cursus: {exercise.course_name}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            <span>De oefening duurt ongeveer {exercise.duration || 5} minuten</span>
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap">
                                            <Link
                                                href={`/exercises/${exercise.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7B5EA7] text-white rounded-lg hover:bg-[#5a3a7a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                                Start oefening
                                            </Link>

                                            <button
                                                onClick={() => removeFavorite(exercise.id)}
                                                className="inline-flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                                                aria-label={`Verwijder ${exercise.exercise_name} uit favorieten`}
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="flex justify-start">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-400 rounded-lg hover:bg-gray-100 hover:border-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                                aria-label="Terug naar dashboard"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Terug naar dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
