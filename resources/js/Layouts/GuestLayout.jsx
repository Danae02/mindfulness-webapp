import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div aria-hidden="true">
                <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
            </div>

            <main className="mt-6 w-full overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-xl" style={{ border: '1px solid #5F5F5F', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                {children}
            </main>
        </div>
    );
}
