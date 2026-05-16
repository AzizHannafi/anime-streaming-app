import { useEffect, useState, useCallback } from "react";
import { Menu, X, Heart, History } from "lucide-react";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getAnimeByGenre,
  getAnimeDetails,
  AnimeItem,
  AnimeDetail,
} from "@/lib/tmdb";
import { useWatchHistory, useFavorites } from "@/hooks/useLocalStorage";
import AnimeCarousel from "@/components/AnimeCarousel";
import AnimeCard from "@/components/AnimeCard";
import AnimeDetailModal from "@/components/AnimeDetailModal";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";

export default function Home() {
  const [trendingAnime, setTrendingAnime] = useState<AnimeItem[]>([]);
  const [popularAnime, setPopularAnime] = useState<AnimeItem[]>([]);
  const [topRatedAnime, setTopRatedAnime] = useState<AnimeItem[]>([]);
  const [actionAnime, setActionAnime] = useState<AnimeItem[]>([]);
  const [romanceAnime, setRomanceAnime] = useState<AnimeItem[]>([]);
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetail | null>(null);
  const [playingAnime, setPlayingAnime] = useState<AnimeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { favorites } = useFavorites();
  const { history } = useWatchHistory();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [trending, popular, topRated, action, romance] = await Promise.all([
          getTrendingAnime(1),
          getPopularAnime(1),
          getTopRatedAnime(1),
          getAnimeByGenre(16, 2), // Animation - page 2
          getAnimeByGenre(16, 3), // Animation - page 3
        ]);

        setTrendingAnime(trending.results);
        setPopularAnime(popular.results);
        setTopRatedAnime(topRated.results);
        setActionAnime(action.results);
        setRomanceAnime(romance.results);
        
        // Log sample IMDb IDs for debugging
        if (trending.results.length > 0) {
          console.log("Loaded anime:", trending.results.length, "items");
          console.log("Sample anime:", trending.results[0]);
        } else {
          console.warn("No anime loaded");
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Failed to load anime data");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle anime selection
  const handleSelectAnime = useCallback(async (anime: AnimeItem) => {
    try {
      const details = await getAnimeDetails(anime.id, anime.media_type);
      if (details) {
        setSelectedAnime(details);
      }
    } catch (error) {
      console.error("Error fetching anime details:", error);
      toast.error("Failed to load anime details");
    }
  }, []);

  // Handle play click
  const handlePlayClick = useCallback(async (anime: AnimeItem | AnimeDetail) => {
    try {
      let details = anime as AnimeDetail;
      if (!("genres" in anime)) {
        const fetchedDetails = await getAnimeDetails(anime.id, anime.media_type);
        if (fetchedDetails) {
          details = fetchedDetails;
        } else {
          toast.error("Failed to load anime details");
          return;
        }
      }
      setPlayingAnime(details);
      setSelectedAnime(null);
    } catch (error) {
      console.error("Error playing anime:", error);
      toast.error("Failed to start playback");
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const { results } = await getTrendingAnime(1); // Placeholder - use actual search
      // For now, filter trending results by query
      const filtered = results.filter(
        (anime) =>
          (anime.title || anime.name || "")
            .toLowerCase()
            .includes(query.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : results.slice(0, 12));
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-cyan-500/20">
        <div className="container flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              AnimeVerse
            </span>
          </div>

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            onSelectAnime={handleSelectAnime}
          />

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Favorites Button */}
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-purple-500/30 text-white transition-all duration-200"
              onClick={() => toast.info(`${favorites.length} favorites saved`)}
            >
              <Heart size={20} />
              <span className="text-sm">{favorites.length}</span>
            </button>

            {/* History Button */}
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-cyan-500/30 text-white transition-all duration-200"
              onClick={() => toast.info(`${history.length} items in history`)}
            >
              <History size={20} />
              <span className="text-sm">{history.length}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="sm:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="sm:hidden bg-slate-900/95 border-b border-cyan-500/20 p-4 space-y-3">
          <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-purple-500/30 text-white transition-all duration-200">
            <Heart size={20} />
            <span>{favorites.length} Favorites</span>
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-cyan-500/30 text-white transition-all duration-200">
            <History size={20} />
            <span>{history.length} Watch History</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-8 space-y-12">
        {/* Hero Section */}
        <section className="relative h-96 rounded-lg overflow-hidden neon-border neon-glow group">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663052420117/WPMic9wztkxzQqsVQcMx4f/hero-banner-1-Q8qeBFSgHqGLSEMuQTjYCF.webp"
            alt="Featured"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
            <div className="p-8 space-y-4 max-w-md">
              <h1 className="text-4xl font-bold gradient-text">
                Welcome to AnimeVerse
              </h1>
              <p className="text-white/80">
                Discover thousands of anime with premium streaming quality
              </p>
              <button
                onClick={() => {
                  if (trendingAnime.length > 0) {
                    handlePlayClick(trendingAnime[0]);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 transform hover:scale-105"
              >
                Watch Now
              </button>
            </div>
          </div>
        </section>

        {/* Continue Watching */}
        {history.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold gradient-text mb-4">
              Continue Watching
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {history.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="h-56 cursor-pointer"
                  onClick={() => {
                    const anime = trendingAnime.find((a) => a.id === item.id) ||
                      popularAnime.find((a) => a.id === item.id) || {
                      id: item.id,
                      title: item.title,
                      poster_path: item.poster_path,
                      backdrop_path: null,
                      overview: "",
                      vote_average: 0,
                      genre_ids: [],
                      media_type: "tv" as const,
                      popularity: 0,
                    };
                    handleSelectAnime(anime);
                  }}
                >
                  <AnimeCard
                  anime={{
                      id: item.id,
                      title: item.title,
                      poster_path: item.poster_path,
                      backdrop_path: null,
                      overview: "",
                      vote_average: 0,
                      genre_ids: [],
                      media_type: "tv" as const,
                      popularity: 0,
                    }}
                    onSelect={() => {}}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Anime */}
        <AnimeCarousel
          title="Trending Now"
          anime={trendingAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
          onPlayClick={handlePlayClick}
        />

        {/* Popular Anime */}
        <AnimeCarousel
          title="Most Popular"
          anime={popularAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
          onPlayClick={handlePlayClick}
        />

        {/* Top Rated Anime */}
        <AnimeCarousel
          title="Top Rated"
          anime={topRatedAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
          onPlayClick={handlePlayClick}
        />

        {/* Action Anime */}
        <AnimeCarousel
          title="Action Anime"
          anime={actionAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
          onPlayClick={handlePlayClick}
        />

        {/* Romance Anime */}
        <AnimeCarousel
          title="Romance Anime"
          anime={romanceAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
          onPlayClick={handlePlayClick}
        />

        {/* Search Results */}
        {isSearching && (
          <section>
            <h2 className="text-2xl font-bold gradient-text mb-4">
              Searching...
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 bg-white/10 rounded-lg animate-pulse neon-border"
                />
              ))}
            </div>
          </section>
        )}

        {searchResults.length > 0 && !isSearching && (
          <section>
            <h2 className="text-2xl font-bold gradient-text mb-4">
              Search Results
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((anime) => (
                <div key={anime.id} className="h-56">
                  <AnimeCard
                    anime={anime}
                    onSelect={handleSelectAnime}
                    onPlayClick={handlePlayClick}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={!!selectedAnime}
        onClose={() => setSelectedAnime(null)}
        onPlayClick={handlePlayClick}
      />

      <VideoPlayerModal
        anime={playingAnime}
        isOpen={!!playingAnime}
        onClose={() => setPlayingAnime(null)}
      />

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-black/50 py-8 mt-12">
        <div className="container text-center text-white/60 text-sm">
          <p>© 2026 AnimeVerse. All rights reserved.</p>
          <p className="mt-2">Powered by TMDB API</p>
        </div>
      </footer>
    </div>
  );
}
