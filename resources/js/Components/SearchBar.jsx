export default function SearchBar({ searchTerm, onSearch, catTerm }) {
    const id = "searchbar-" + (catTerm ?? "input").replace(/\s+/g, '-');

    return (
        <div className="">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                Zoek naar {catTerm}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                </div>
                <input
                    id={id}
                    type="search"
                    className="w-full pl-9 pr-4 py-2 border border-gray-700 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6C4092] focus:ring-offset-1 focus:border-[#6C4092]"
                    placeholder={"Zoek naar " + catTerm + "..."}
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                    aria-label={"Zoek naar " + catTerm}
                />
            </div>
        </div>
    );
}
