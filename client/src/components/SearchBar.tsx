import { Search, X, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { searchAnime, AnimeItem } from "@/lib/tmdb";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectAnime: (anime: AnimeItem) => void;
}

export default function SearchBar({ onSearch, onSelectAnime }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    "anime_recent_searches",
    []
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        const data = await searchAnime(query, 1);
        setResults(data.results.slice(0, 8));
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const newRecent = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      onSearch(searchQuery);
      setQuery("");
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectAnime = (anime: AnimeItem) => {
    onSelectAnime(anime);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" size={20} />
        <input
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-white/10 border border-cyan-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/50 transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/20 max-h-96 overflow-y-auto z-50">
          {/* Search Results */}
          {query && results.length > 0 && (
            <div>
              <p className="px-4 py-2 text-white/60 text-xs font-semibold">
                SEARCH RESULTS
              </p>
              {results.map((anime) => (
                <button
                  key={anime.id}
                  onClick={() => handleSelectAnime(anime)}
                  className="w-full px-4 py-2 flex gap-3 hover:bg-white/10 transition-colors duration-200 text-left"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w92${anime.poster_path}`}
                    alt={anime.title || anime.name}
                    className="w-8 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {anime.title || anime.name}
                    </p>
                    <p className="text-white/60 text-xs">
                      ★ {anime.vote_average.toFixed(1)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {query && isLoading && (
            <div className="px-4 py-4 text-center text-white/60 text-sm">
              Searching...
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && results.length === 0 && (
            <div className="px-4 py-4 text-center text-white/60 text-sm">
              No anime found
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <p className="px-4 py-2 text-white/60 text-xs font-semibold">
                RECENT SEARCHES
              </p>
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 text-left text-white/80 text-sm"
                >
                  <TrendingUp size={16} className="text-cyan-400" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className="px-4 py-4 text-center text-white/60 text-sm">
              Start typing to search
            </div>
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
