import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "@/Components/SearchBar.jsx";

export default function PaginatedDataTable(
    {
        linkForPagination
    }) {

    const [dataPoints, setDataPoints] = useState([]); // Bevat de huidige pagina met data
    const [currentPage, setCurrentPage] = useState(1); // Huidige pagina
    const [totalPages, setTotalPages] = useState(0); // Totaal aantal pagina's
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // Search term for name filtering


    // Ophalen van gegevens bij paginawijziging
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = (page) => {
        setLoading(true);
        axios
            .get(linkForPagination, { params: { page } }) // Stuur de huidige pagina als queryparameter
            .then((response) => {
                const data = response.data;
                setDataPoints(data.data); // De gegevens voor de huidige pagina
                setCurrentPage(data.current_page); // De huidige pagina
                setTotalPages(data.last_page); // Het totale aantal pagina's
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    };

    const searchedExercises = dataPoints.filter(datapoint =>
        datapoint.exercise.exercise_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage); // Verander de huidige pagina
        }
    };

    return (
        <div>

            <div className="flex items-center mb-4 space-x-4">
                <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} catTerm="datapunt"/>
            </div>

            {loading ? (
                <p>Data wordt geladen...</p>
            ) : (
                <div>
                    {searchedExercises.length === 0 ? (
                        <p>Geen data gevonden</p>
                    ) : (
                        <>

                            <table className="table-auto w-full border-collapse border border-gray-300">
                                <thead>
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2">Log ID</th>
                                    <th className="border border-gray-300 px-4 py-2">Gebruiker</th>
                                    <th className="border border-gray-300 px-4 py-2">Oefening</th>
                                    <th className="border border-gray-300 px-4 py-2">Duur Geluisterd</th>
                                    <th className="border border-gray-300 px-4 py-2">Voltooid</th>
                                    <th className="border border-gray-300 px-4 py-2">Gevoel Voor</th>
                                    <th className="border border-gray-300 px-4 py-2">Gevoel Na</th>
                                </tr>
                                </thead>
                                <tbody>
                                {searchedExercises.map((log) => (
                                    <tr key={log.log_id}>
                                        <td className="border border-gray-300 px-4 py-2">{log.log_id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.user_id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.exercise?.exercise_name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.duration_listened}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.completed ? "Ja" : "Nee"}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.feeling_before}</td>
                                        <td className="border border-gray-300 px-4 py-2">{log.feeling_after}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* Paginatieknoppen */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    Vorige
                </button>
                <span>
                    Pagina {currentPage} van {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    Volgende
                </button>
            </div>
        </div>
    );
}
