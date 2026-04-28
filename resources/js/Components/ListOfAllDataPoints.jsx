import PaginatedDataTable from "@/Components/PaginatedDataTable.jsx";

export default function ListOfAllDataPoints({ researchGroups = [], exercises = [] }) {
    return (
        <PaginatedDataTable
            linkForPagination="/logs"
            researchGroups={researchGroups}
            exercises={exercises}
        />
    );
}
