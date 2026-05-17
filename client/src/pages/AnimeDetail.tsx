import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Play, Heart, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { getAnimeDetails, getPosterUrl, AnimeItem } from "@/lib/tmdb";
import { useFavorites } from "@/hooks/useLocalStorage";
import VideoPlayerModal from "@/components/VideoPlayerModal";

export default function AnimeDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/anime/:id");
  const [anime, setAnime] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const animeId = params?.id ? parseInt(params.id) : null;
  const isFav = anime && isFavorite(anime.id);

  useEffect(() => {
    const loadAnimeDetails = async () => {
      if (!animeId) return;

      try {
        setIsLoading(true);
        const details = await getAnimeDetails(animeId);
        setAnime(details);
      } catch (error) {
        console.error("Failed to load anime details:", error);
        toast.error("Failed to load anime details");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimeDetails();
  }, [animeId, navigate]);

  const handleFavorite = () => {
    if (anime) {
      toggleFavorite({
        id: anime.id,
        title: anime.title || anime.name || "Unknown",
        poster_path: anime.poster_path,
      });
      toast.success(isFav ? "Removed from favorites" : "Added to favorites");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-orange-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading anime details...</p>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold">Anime not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 p-2 bg-black/50 hover:bg-orange-600/50 text-white rounded-full transition-all"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Hero Section with Backdrop */}
      <div className="netflix-detail-hero">
        <div className="netflix-detail-backdrop">
          {anime.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/original${anime.backdrop_path}`}
              alt={anime.title || anime.name}
              className="netflix-detail-backdrop-image"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-900/30 to-black" />
          )}
        </div>
        <div className="netflix-detail-overlay" />
        <div className="netflix-detail-content">
          <div className="netflix-detail-info">
            <h1 className="netflix-detail-title">
              {anime.title || anime.name}
            </h1>
            <div className="netflix-detail-meta">
              <span className="flex items-center gap-1">
                ⭐ {anime.vote_average?.toFixed(1) || "N/A"}
              </span>
              <span>{anime.first_air_date?.split("-")[0] || "N/A"}</span>
              <span>{anime.number_of_seasons ? `${anime.number_of_seasons} Seasons` : "N/A"}</span>
            </div>
            <p className="netflix-detail-description">
              {anime.overview}
            </p>
            <div className="flex items-center gap-4 pt-4">
              <button
                className="netflix-cta"
                onClick={() => setIsPlaying(true)}
              >
                <Play size={20} fill="currentColor" />
                Watch Now
              </button>
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-full transition-all ${
                  isFav
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/50"
                    : "bg-white/20 text-white hover:bg-orange-600/50"
                }`}
              >
                <Heart size={20} fill={isFav ? "currentColor" : "none"} />
              </button>
              <button className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container py-12 space-y-12">
        {/* About */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">About</h2>
          <p className="text-gray-300 leading-relaxed max-w-3xl">
            {anime.overview}
          </p>
        </section>

        {/* Cast & Crew */}
        {anime.credits?.cast && anime.credits.cast.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {anime.credits.cast.slice(0, 10).map((actor: any) => (
                <div key={actor.id} className="space-y-2">
                  {actor.profile_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <p className="font-semibold text-sm">{actor.name}</p>
                  <p className="text-xs text-gray-400">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre: any) => (
                <span
                  key={genre.id}
                  className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-full text-sm border border-orange-500/30"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {anime.status && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Status</p>
              <p className="font-semibold">{anime.status}</p>
            </div>
          )}
          {anime.first_air_date && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">First Air Date</p>
              <p className="font-semibold">{anime.first_air_date}</p>
            </div>
          )}
          {anime.last_air_date && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Last Air Date</p>
              <p className="font-semibold">{anime.last_air_date}</p>
            </div>
          )}
          {anime.number_of_episodes && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Total Episodes</p>
              <p className="font-semibold">{anime.number_of_episodes}</p>
            </div>
          )}
          {anime.networks && anime.networks.length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Networks</p>
              <p className="font-semibold">{anime.networks[0]?.name}</p>
            </div>
          )}
          {anime.vote_average && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Rating</p>
              <p className="font-semibold flex items-center gap-1">
                ⭐ {anime.vote_average.toFixed(1)}/10
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlaying}
        onClose={() => setIsPlaying(false)}
        anime={anime}
      />
    </div>
  );
}
