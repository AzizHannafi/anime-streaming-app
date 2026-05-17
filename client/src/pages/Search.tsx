import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Grid, List } from "lucide-react";
import { searchAnime, AnimeItem, getPosterUrl } from "@/lib/tmdb";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setQuery(q);
    setPage(1);

    if (q.trim()) {
      loadSearchResults(q, 1);
    }
  }, []);

  const loadSearchResults = async (searchQuery: string, pageNum: number) => {
    try {
      setIsLoading(true);
      const data = await searchAnime(searchQuery, pageNum);
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
    loadSearchResults(query, nextPage);
  };

  const handleSelectAnime = (anime: AnimeItem) => {
    navigate(`/anime/${anime.id}`);
  };

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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Search Results for "{query}"
            </h1>
            <p className="text-gray-400 text-sm">
              Found {results.length} anime
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-orange-600 text-white"
                  : "hover:bg-white/10"
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-orange-600 text-white"
                  : "hover:bg-white/10"
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container py-8">
        {results.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No results found for "{query}"</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
            >
              Back to Home
            </button>
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
    </div>
  );
}
