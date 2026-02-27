export default function Sidebar({ setView }) {
    return (
        <div className="w-1/4 bg-gray-800 text-white h-screen">
            <div className="p-4">
                <h3 className="text-lg font-semibold">Admin Menu</h3>
                <ul className="mt-4 space-y-2">
                    <li>
                        <button
                            onClick={() => setView("courses")}
                            className="w-full text-left p-2 hover:bg-gray-700 rounded"
                        >
                            Alle Cursussen
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setView("addCourse")}
                            className="w-full text-left p-2 hover:bg-gray-700 rounded"
                        >
                            Cursus Toevoegen
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setView("allDatapoints")}
                            className="w-full text-left p-2 hover:bg-gray-700 rounded"
                        >
                            Lijst van alle datapunten
                        </button>
                    </li>
                    {/*<li>*/}
                    {/*    <button*/}
                    {/*        onClick={() => setView("logDuration")}*/}
                    {/*        className="w-full text-left p-2 hover:bg-gray-700 rounded"*/}
                    {/*    >*/}
                    {/*        Grafieken van de duur*/}
                    {/*    </button>*/}
                    {/*</li>*/}
                    <li>
                        <button
                            onClick={() => setView("listOfAllUsers")}
                            className="w-full text-left p-2 hover:bg-gray-700 rounded"
                        >
                            Lijst van alle gebruikers
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setView("researchSettings")}
                            className="w-full text-left p-2 hover:bg-gray-700 rounded"
                        >
                            Instellingen voor onderzoek
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
