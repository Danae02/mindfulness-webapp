import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function SessionChartData({
                                             data = [],
                                             loading = false
                                         }) {
    if (loading) {
        return (
            <div style={{ width: '100%', height: 400 }} className="flex items-center justify-center">
                <p className="text-gray-500">Data laden...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div style={{ width: '100%', height: 400 }} className="flex items-center justify-center">
                <p className="text-gray-500">Geen data beschikbaar</p>
            </div>
        );
    }

    const chartData = data.map(log => ({
        name: log.user?.name || 'Onbekend',
        duration: log.total_duration || 0,
    }));

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h2 className="text-lg font-semibold mb-4">Sessieduur per Gebruiker</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
