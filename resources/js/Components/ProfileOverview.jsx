import { usePage } from "@inertiajs/react";

export default function ProfileOverview({ exerciseCountLastWeek }) {
    const user = usePage().props.auth.user;

    return (
        <div className="flex items-center justify-center max-w-7xl sm:px-6 lg:px-8">
            <div className="w-full bg-white shadow-card rounded-xl p-8 text-center">
                <h1 className="text-3xl font-heading font-bold text-darkGray mb-4">
                    Hallo <span className="text-primary">{user.name}</span>! Welkom terug.
                </h1>
                <p className="text-lg text-gray-600">
                    Deze week heb je <span className="font-bold text-primary">{exerciseCountLastWeek}</span> oefeningen geluisterd.
                </p>
                <div className="mt-6">
                    <button className="border-2 border-primary text-primary bg-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-md">
                        Bekijk mijn oefeningen
                    </button>
                </div>
            </div>
        </div>
    );
}

