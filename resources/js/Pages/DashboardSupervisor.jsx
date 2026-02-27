import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import SessionChartData from "@/Components/SessionChartData.jsx";
import RegisterUserAsSupervisor from "@/Components/RegisterUserAsSupervisor.jsx";
import TeamList from "@/Components/TeamList.jsx";

export default function DashboardSupervisor() {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Haal gebruikers en logs op
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get(route('users.get.team'));
                setUsers(usersResponse.data);

                const logsResponse = await axios.get(route('users.get.team.logs'));
                setLogs(logsResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Er is een fout opgetreden:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Logdata voor grafieken en tabellen
    const logsByUser = logs.map(log => ({
        user: log.user.name,
        exercise: log.exercise.title,
        duration: log.duration_listened,
        completed: log.completed ? 'Ja' : 'Nee',
        feelingBefore: log.feeling_before,
        feelingAfter: log.feeling_after,
        dateTime: log.date_time,
    }));

    return (
        <AuthenticatedLayout>
            {/*<div>*/}
            {/*    <h2>Supervisor Dashboard</h2>*/}

            {/*    <div style={{ marginBottom: '20px' }}>*/}
            {/*        <h3>Gebruikers Logs per Team</h3>*/}
            {/*        <BarChart width={600} height={300} data={logsByUser}>*/}
            {/*            <CartesianGrid strokeDasharray="3 3" />*/}
            {/*            <XAxis dataKey="user" />*/}
            {/*            <YAxis />*/}
            {/*            <Tooltip />*/}
            {/*            <Bar dataKey="duration" fill="#8884d8" name="Duur (minuten)" />*/}
            {/*        </BarChart>*/}
            {/*    </div>*/}

            {/*    <div>*/}
            {/*        <h3>Details Logs</h3>*/}
            {/*        <table>*/}
            {/*            <thead>*/}
            {/*            <tr>*/}
            {/*                <th>Gebruiker</th>*/}
            {/*                <th>Oefening</th>*/}
            {/*                <th>Duur (min)</th>*/}
            {/*                <th>Voltooid</th>*/}
            {/*                <th>Gevoel Vooraf</th>*/}
            {/*                <th>Gevoel Achteraf</th>*/}
            {/*                <th>Datum</th>*/}
            {/*            </tr>*/}
            {/*            </thead>*/}
            {/*            <tbody>*/}
            {/*            {logsByUser.map((log, index) => (*/}
            {/*                <tr key={index}>*/}
            {/*                    <td>{log.user}</td>*/}
            {/*                    <td>{log.exercise}</td>*/}
            {/*                    <td>{log.duration}</td>*/}
            {/*                    <td>{log.completed}</td>*/}
            {/*                    <td>{log.feelingBefore}</td>*/}
            {/*                    <td>{log.feelingAfter}</td>*/}
            {/*                    <td>{log.dateTime}</td>*/}
            {/*                </tr>*/}
            {/*            ))}*/}
            {/*            </tbody>*/}
            {/*        </table>*/}
            {/*    </div>*/}
            {/*</div>*/}

            <TeamList />

            {/*<RegisterUserAsSupervisor />*/}

            {/*<SessionChartData />*/}
        </AuthenticatedLayout>
    );
};
