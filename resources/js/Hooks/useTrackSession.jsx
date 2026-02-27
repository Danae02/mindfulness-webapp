import { useEffect } from 'react';
import axios from 'axios';

export default function useTrackSession() {
    useEffect(() => {
        // Opslaan van de inlogtijd
        const loginTime = new Date().toISOString();
        localStorage.setItem('loginTime', loginTime);

        console.log(loginTime)

        // Event listener bij sluiten van de pagina
        const handleUnload = async () => {
            const logoutTime = new Date().toISOString();
            const loginTime = localStorage.getItem('loginTime');

            const feelingBefore = localStorage.getItem('feelingBefore')
            const feelingAfter = localStorage.getItem('feelingAfter')

            // Bereken de duur in seconden
            const duration = Math.floor((new Date(logoutTime) - new Date(loginTime)) / 1000);

            try {
                await axios.post('/api/session-logs', {
                    duration,
                });
            } catch (error) {
                console.error('Error tracking session:', error);
            }
        };

        // Voeg eventlistener toe
        window.addEventListener('unload', handleUnload);

        // Verwijder eventlistener bij unmounten
        return () => {
            localStorage.removeItem('feeling_before');
            localStorage.removeItem('feeling_after');
            window.removeEventListener('unload', handleUnload);
        };
    }, []);
};
