import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "@/Components/SearchBar.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

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

    const formatCompleted = (completed) => {
        return completed ? "Ja" : "Nee";
    };

    return (
        <div>
            <div className="flex items-center mb-6 space-x-4">
                <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} catTerm="datapunt"/>
            </div>

            {loading ? (
                <LoadingIndicator message="Datapunten laden..." />
            ) : (
                <div>
                    {searchedExercises.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Geen data gevonden
                        </div>
                    ) : (
                        <>
                            {/* better table */}
                            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Log ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gebruiker
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Oefening
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duur Geluisterd
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Voltooid
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gevoel Voor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gevoel Na
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {searchedExercises.map((log) => (
                                        <tr
                                            key={log.log_id}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.log_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.user_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.exercise?.exercise_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.duration_listened} sec
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        log.completed
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {formatCompleted(log.completed)}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.feeling_before || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.feeling_after || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Paginatieknoppen met moderne styling */}
            {!loading && searchedExercises.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-2 font-semibold"
                        style={{ borderColor: "#6C4092", color: "#6C4092" }}
                    >
                        ← Vorige
                    </button>
                    <span className="text-sm text-gray-600">
                        Pagina {currentPage} van {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-2 font-semibold"
                        style={{ borderColor: "#6C4092", color: "#6C4092" }}
                    >
                        Volgende →
                    </button>
                </div>
            )}
        </div>
    );
}
