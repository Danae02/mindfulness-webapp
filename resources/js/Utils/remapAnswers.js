// utils/remapAnswers.js
//
// Herverdeelt antwoorden bij het wisselen van aantal antwoordopties (3, 4 of 5).
// De semantische posities (laagste, midden, hoogste) blijven behouden.
//
// Bij 3 opties: index 0 = laagst, 1 = midden, 2 = hoogst
// Bij 4 opties: index 0 = laagst,             3 = hoogst  (geen midden)
// Bij 5 opties: index 0 = laagst, 2 = midden, 4 = hoogst
//
// De mapping geeft per combinatie aan: welke oude index naar welke nieuwe index gaat.
// Voorbeeld: [2, 1] betekent old[2] → next[1]

export function remapAnswers(prev, oldN, newN) {
    const empty = () => ({ text: "", icon: null });
    const next = Array(newN).fill(null).map(empty);

    const mappings = {
        3: { 5: [[0,0],[1,2],[2,4]], 4: [[0,0],[2,3]] },
        5: { 3: [[0,0],[2,1],[4,2]], 4: [[0,0],[4,3]] },
        4: { 3: [[0,0],[3,2]],       5: [[0,0],[3,4]] },
    };

    const map = mappings[oldN]?.[newN];

    if (map) {
        map.forEach(([from, to]) => {
            next[to] = prev[from] ?? empty();
        });
    } else {
        // Fallback: kopieer zoveel mogelijk op volgorde (bijv. oldN === newN)
        for (let i = 0; i < Math.min(oldN, newN); i++) {
            next[i] = prev[i] ?? empty();
        }
    }

    return next;
}
