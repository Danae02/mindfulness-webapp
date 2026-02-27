
export default function SearchBar({ searchTerm, onSearch, catTerm }) {
    return (
        <div className="mb-4">
            <input
                type="text"
                className="border px-4 py-2"
                placeholder={ "Zoek naar " + catTerm + "..." }
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)} // Geef zoekterm door aan parent
            />
        </div>
    );
}
