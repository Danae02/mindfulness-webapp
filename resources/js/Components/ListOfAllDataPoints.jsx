import { usePage } from "@inertiajs/react";
import PaginatedDataTable from "@/Components/PaginatedDataTable.jsx";

export default function ListOfAllDataPoints({ researchGroups = [], exercises = [] }) {
    const user = usePage().props.auth.user;
    const userRole = user.role_id; // 1=admin, 4=researcher

    return (
        <PaginatedDataTable
            linkForPagination="/logs"
            researchGroups={researchGroups}
            exercises={exercises}
            userRole={userRole}
        />
    );
}
