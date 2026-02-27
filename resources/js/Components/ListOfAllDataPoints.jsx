import { useEffect, useState } from "react";
import axios from "axios";
import PaginatedDataTable from "@/Components/PaginatedDataTable.jsx";

export default function ListOfAllDataPoints() {
    return(
        <>
            <PaginatedDataTable linkForPagination="/logs"/>
        </>
    )
}

