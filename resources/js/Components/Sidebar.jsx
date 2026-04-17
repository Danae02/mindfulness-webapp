import { useState } from 'react';

export default function Sidebar({ setView, currentView }) {

    const handleViewChange = (view) => {
        setView(view);
    };

    return (
        <div className="w-full md:w-1/4 bg-[#312C50] text-white md:min-h-screen">
            <div className="p-4">
                <h3 className="text-lg font-semibold break-words">Admin Menu</h3>
                <ul className="mt-4 space-y-2">
                    <li>
                        <button
                            onClick={() => handleViewChange("courses")}
                            className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                currentView === "courses"
                                    ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                    : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                            }`}
                            style={{
                                ...(currentView === "courses" && {
                                    boxShadow: 'inset 3px 0 0 #9B6DD4'
                                })
                            }}
                        >
                            <span className="break-words">Alle Cursussen</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleViewChange("addCourse")}
                            className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                currentView === "addCourse"
                                    ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                    : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                            }`}
                            style={{
                                ...(currentView === "addCourse" && {
                                    boxShadow: 'inset 3px 0 0 #9B6DD4'
                                })
                            }}
                        >
                            <span className="break-words">Cursus Toevoegen</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleViewChange("allDatapoints")}
                            className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                currentView === "allDatapoints"
                                    ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                    : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                            }`}
                            style={{
                                ...(currentView === "allDatapoints" && {
                                    boxShadow: 'inset 3px 0 0 #9B6DD4'
                                })
                            }}
                        >
                            <span className="break-words">Lijst van alle datapunten</span>
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
                            onClick={() => handleViewChange("listOfAllUsers")}
                            className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                currentView === "listOfAllUsers"
                                    ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                    : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                            }`}
                            style={{
                                ...(currentView === "listOfAllUsers" && {
                                    boxShadow: 'inset 3px 0 0 #9B6DD4'
                                })
                            }}
                        >
                            <span className="break-words">Lijst van alle gebruikers</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleViewChange("researchSettings")}
                            className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                currentView === "researchSettings"
                                    ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                    : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                            }`}
                            style={{
                                ...(currentView === "researchSettings" && {
                                    boxShadow: 'inset 3px 0 0 #9B6DD4'
                                })
                            }}
                        >
                            <span className="break-words">Gevoelsvragen beheren</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
