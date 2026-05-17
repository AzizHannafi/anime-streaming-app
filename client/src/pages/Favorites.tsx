import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useLocalStorage";
import { getAnimeDetails, getPosterUrl } from "@/lib/tmdb";
import VideoPlayerModal from "@/components/VideoPlayerModal";

interface FavoriteAnime {
  id: number;
  title: string;
  poster_path: string | null;
  details?: any;
}

export default function Favorites() {
  const [, navigate] = useLocation();
  const { favorites, removeFromFavorites } = useFavorites();
  const [favoriteDetails, setFavoriteDetails] = useState<FavoriteAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingAnime, setPlayingAnime] = useState<any>(null);

  useEffect(() => {
    const loadFavoriteDetails = async () => {
      try {
        setIsLoading(true);
        const details = await Promise.all(
          favorites.map(async (fav) => {
            try {
              const animeDetails = await getAnimeDetails(fav.id);
              return {
                ...fav,
                details: animeDetails,
              };
            } catch {
              return fav;
            }
          })
        );
        setFavoriteDetails(details);
      } catch (error) {
        console.error("Failed to load favorite details:", error);
        toast.error("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    };

    if (favorites.length > 0) {
      loadFavoriteDetails();
    } else {
      setIsLoading(false);
    }
  }, [favorites]);

  const handleRemoveFavorite = (id: number) => {
    removeFromFavorites(id);
    toast.success("Removed from favorites");
  };

  const handleViewDetail = (id: number) => {
    navigate(`/anime/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container flex items-center gap-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">My Favorites</h1>
            <p className="text-sm text-gray-400">{favorites.length} anime saved</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container pt-32 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-orange-600 rounded-full animate-spin mx-auto" />
              <p className="text-gray-400">Loading favorites...</p>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-96 space-y-6">
            <div className="text-6xl">📭</div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">No favorites yet</h2>
              <p className="text-gray-400">
                Start adding anime to your favorites to see them here
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="netflix-cta"
            >
              Explore Anime
            </button>
          </div>
        ) : (
          <div className="netflix-grid">
            {favoriteDetails.map((anime) => (
              <div
                key={anime.id}
                className="netflix-grid-item relative group/grid rounded-lg overflow-hidden"
              >
                {/* Poster */}
                <div
                  className="relative w-full h-56 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => handleViewDetail(anime.id)}
                >
                  <img
                    src={getPosterUrl(anime.poster_path)}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover/grid:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/grid:opacity-100 transition-opacity duration-300" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/grid:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayingAnime(anime.details || anime);
                      }}
                      className="netflix-play-icon"
                    >
                      <Play size={24} fill="currentColor" />
                    </button>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-300">
                    <h3 className="font-bold text-sm line-clamp-2">
                      {anime.title}
                    </h3>
                    {anime.details?.vote_average && (
                      <p className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                        ⭐ {anime.details.vote_average.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-300 flex gap-2">
                  <button
                    onClick={() => handleRemoveFavorite(anime.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {playingAnime && (
        <VideoPlayerModal
          isOpen={!!playingAnime}
          onClose={() => setPlayingAnime(null)}
          anime={playingAnime}
        />
      )}
    </div>
  );
}
