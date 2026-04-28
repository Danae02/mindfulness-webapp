/**
 * Geeft true terug als de gegeven YYYY-MM-DD string vandaag is.
 */
export function isToday(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const d     = new Date(dateString + "T00:00:00");
    return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth()    === today.getMonth() &&
        d.getDate()     === today.getDate()
    );
}
