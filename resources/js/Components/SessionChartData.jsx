import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function SessionChartData() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Haal data op van de server
        axios.get(route('exercise-logs.get.duration_sessions'))
            .then(response => {
                const chartData = response.data.map(log => ({
                    name: log.user.name, // Naam van de gebruiker
                    duration: log.total_duration, // Totale sessieduur in seconden
                }));
                setData(chartData);
            })
            .catch(error => console.error('Error fetching session data:', error));
    }, []);

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h2>Sessieduur per Gebruiker</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
