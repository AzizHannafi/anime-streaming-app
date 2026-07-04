import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Grid, List, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import {
  searchAnime,
  discoverAnime,
  AnimeItem,
  AnimeFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  getPosterUrl,
} from "@/lib/tmdb";
import { Skeleton } from "@/components/ui/skeleton";
import SearchFilters from "@/components/SearchFilters";

export default function Search() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [filters, setFilters] = useState<AnimeFilters>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setQuery(q);
    setQueryInput(q);
    setPage(1);
    loadResults(1, q, DEFAULT_FILTERS);
  }, []);

  const runSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
    loadResults(1, searchQuery, filters);
    const url = searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search";
    window.history.replaceState(null, "", url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(queryInput);
  };

  const handleClearSearch = () => {
    setQueryInput("");
    runSearch("");
  };

  const loadResults = async (pageNum: number, searchQuery: string, activeFilters: AnimeFilters) => {
    try {
      setIsLoading(true);
      const data = searchQuery.trim()
        ? await searchAnime(searchQuery, pageNum, activeFilters)
        : await discoverAnime(activeFilters, pageNum);
      if (pageNum === 1) {
        setResults(data.results);
      } else {
        setResults((prev) => [...prev, ...data.results]);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadResults(nextPage, query, filters);
  };

  const handleApplyFilters = (newFilters: AnimeFilters) => {
    setFilters(newFilters);
    setPage(1);
    loadResults(1, query, newFilters);
  };

  const handleSelectAnime = (anime: AnimeItem) => {
    navigate(`/anime/${anime.id}`);
  };

  const filtersActive = hasActiveFilters(filters);
  const activeFilterCount =
    filters.genres.length +
    (filters.contentType !== "all" ? 1 : 0) +
    (filters.year ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.hideAdultContent !== DEFAULT_FILTERS.hideAdultContent ? 1 : 0);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-orange-600/20">
        <div className="container flex items-center gap-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                size={18}
              />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search anime by name..."
                className="w-full pl-10 pr-10 py-2 bg-white/10 border border-orange-600/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500 transition-all"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFiltersOpen(true)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-colors ${
                filtersActive
                  ? "bg-orange-600 text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-black/20 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-orange-600 text-black"
                  : "hover:bg-white/10 text-white"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-orange-600 text-black"
                  : "hover:bg-white/10 text-white"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {query ? `Search Results for "${query}"` : "Browse Anime"}
          </h1>
          <p className="text-gray-400 text-sm">
            Found {results.length} title{results.length !== 1 ? "s" : ""}
          </p>
        </div>

        {results.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              {query
                ? `No results found for "${query}"`
                : "No titles match the current filters"}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              {filtersActive && (
                <button
                  onClick={() => handleApplyFilters(DEFAULT_FILTERS)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  : "space-y-4"
              }
            >
              {isLoading && page === 1
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="w-full h-64 rounded-lg" />
                      <Skeleton className="w-full h-4 rounded" />
                    </div>
                  ))
                : results.map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => handleSelectAnime(anime)}
                      className={
                        viewMode === "grid"
                          ? "group cursor-pointer"
                          : "flex gap-4 p-4 bg-card rounded-lg hover:bg-card/80 transition-all cursor-pointer"
                      }
                    >
                      {viewMode === "grid" ? (
                        <>
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={getPosterUrl(anime.poster_path)}
                              alt={anime.title || anime.name}
                              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">▶</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="font-semibold line-clamp-2 text-sm">
                              {anime.title || anime.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              ⭐ {anime.vote_average?.toFixed(1) || "N/A"}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={getPosterUrl(anime.poster_path)}
                            alt={anime.title || anime.name}
                            className="w-24 h-36 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">
                              {anime.title || anime.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              ⭐ {anime.vote_average?.toFixed(1) || "N/A"}/10
                            </p>
                            <p className="text-sm text-gray-300 line-clamp-3">
                              {anime.overview || "No description available"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
            </div>

            {results.length > 0 && !isLoading && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold"
                >
                  Load More Results
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <SearchFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
