import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Play, ChevronRight, ChevronLeft, Search, Heart, History } from "lucide-react";
import { toast } from "sonner";
import { getTrendingAnime, getPopularAnime, getTopRatedAnime, AnimeItem } from "@/lib/tmdb";
import { useFavorites } from "@/hooks/useLocalStorage";
import AnimeCarousel from "@/components/AnimeCarousel";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  const [, navigate] = useLocation();
  const [trendingAnime, setTrendingAnime] = useState<AnimeItem[]>([]);
  const [popularAnime, setPopularAnime] = useState<AnimeItem[]>([]);
  const [topRatedAnime, setTopRatedAnime] = useState<AnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const { favorites } = useFavorites();

  useEffect(() => {
    const loadAnime = async () => {
      try {
        setIsLoading(true);
        const [trending, popular, topRated] = await Promise.all([
          getTrendingAnime(1),
          getPopularAnime(1),
          getTopRatedAnime(1),
        ]);
        setTrendingAnime(trending.results);
        setPopularAnime(popular.results);
        setTopRatedAnime(topRated.results);
      } catch (error) {
        console.error("Failed to load anime:", error);
        toast.error("Failed to load anime content");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnime();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectAnime = (anime: AnimeItem) => {
    navigate(`/anime/${anime.id}`);
  };

  const featuredAnime = trendingAnime[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Netflix-inspired Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-md shadow-lg"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="container flex items-center justify-between py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
              AV
            </div>
            <span className="text-2xl font-bold gradient-text">AnimeVerse</span>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-sm mx-8">
            {/* Search would go here */}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 hover:bg-white/10 rounded-full transition-all"
              onClick={() => navigate("/favorites")}
              title="Favorites"
            >
              <Heart size={24} />
            </button>
            <button
              className="p-2 hover:bg-white/10 rounded-full transition-all"
              onClick={() => toast.info(`${favorites.length} favorites saved`)}
              title="History"
            >
              <History size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {featuredAnime && (
        <section className="netflix-hero">
          <div className="netflix-hero-backdrop" />
          <div className="container netflix-hero-content pt-32">
            <h1 className="netflix-hero-title">
              {featuredAnime.title || featuredAnime.name}
            </h1>
            <p className="netflix-hero-description">
              {featuredAnime.overview || "Discover this amazing anime"}
            </p>
            <div className="netflix-hero-actions">
              <button
                className="netflix-cta"
                onClick={() => handleSelectAnime(featuredAnime)}
              >
                <Play size={20} fill="currentColor" />
                Watch Now
              </button>
              <button className="netflix-cta-secondary">
                More Info
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <main className="relative z-10 bg-background">
        {/* Trending Now */}
        <AnimeCarousel
          title="Trending Now"
          items={trendingAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
        />

        {/* Top Rated */}
        <AnimeCarousel
          title="Top Rated"
          items={topRatedAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
        />

        {/* Popular */}
        <AnimeCarousel
          title="Popular"
          items={popularAnime}
          isLoading={isLoading}
          onSelectAnime={handleSelectAnime}
        />

        {/* Footer Padding */}
        <div className="h-32" />
      </main>

      {/* Age Verification Modal */}
      <AgeVerificationModal />
    </div>
  );
}
