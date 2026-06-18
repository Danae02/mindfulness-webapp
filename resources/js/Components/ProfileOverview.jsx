import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";

export default function ProfileOverview({ exerciseCountLastWeek }) {
    const user = usePage().props.auth.user;

    return (
        <div className="text-center">
            <h1 className="text-xl sm:text-3xl font-heading font-bold text-darkGray mb-3">
                Hallo <span className="text-primary">{user.name}</span>, welkom bij jouw oefeningen!
            </h1>
            <p className="text-base sm:text-lg mb-6" style={{ color: '#5F5F5F' }}>
                {`Je hebt deze week ${exerciseCountLastWeek} ${exerciseCountLastWeek === 1 ? 'oefening' : 'oefeningen'} gedaan! Blijf oefenen voor de beste resultaten.`}
            </p>
            <div className="flex justify-center">
                <button
                    onClick={() => router.visit(route('favorites'))}
                    className="inline-flex items-center gap-3 rounded-xl font-semibold text-base transition-colors duration-150"
                    style={{
                        backgroundColor: '#F0E8FF',
                        border: '2.5px solid #7B5EA7',
                        color: '#3B2D6E',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                        paddingLeft: '1.75rem',
                        paddingRight: '1.75rem',
                        minHeight: '48px',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#7B5EA7';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = '#5A3F88';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#F0E8FF';
                        e.currentTarget.style.color = '#3B2D6E';
                        e.currentTarget.style.borderColor = '#7B5EA7';
                    }}
                    onFocus={e => {
                        e.currentTarget.style.outline = '3px solid #3B2D6E';
                        e.currentTarget.style.outlineOffset = '3px';
                    }}
                    onBlur={e => {
                        e.currentTarget.style.outline = 'none';
                    }}
                >
                    <span className="sr-only">Mijn favoriete oefeningen bekijken</span>
                    <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                        role="presentation"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span aria-hidden="true">Mijn favoriete oefeningen</span>
                </button>
            </div>
        </div>
    );
}
