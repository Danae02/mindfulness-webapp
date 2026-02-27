import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import GuestLayout from "@/Layouts/GuestLayout.jsx";
import {Head} from "@inertiajs/react";

export default function Test( { auth } ) {
    return (
        <>
            <GuestLayout>
                <Head title="Test"/>



            </GuestLayout>

        </>
    )
}
