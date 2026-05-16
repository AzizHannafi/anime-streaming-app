import { X, Play, Heart, Share2, Clock, Users, Calendar } from "lucide-react";
import { AnimeDetail, getBackdropUrl, getPosterUrl } from "@/lib/tmdb";
import { useFavorites } from "@/hooks/useLocalStorage";
import { useState } from "react";

interface AnimeDetailModalProps {
  anime: AnimeDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayClick?: (anime: AnimeDetail) => void;
}

export default function AnimeDetailModal({
  anime,
  isOpen,
  onClose,
  onPlayClick,
}: AnimeDetailModalProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isShared, setIsShared] = useState(false);

  if (!isOpen || !anime) return null;

  const isFav = isFavorite(anime.id);

  const handleFavoriteClick = () => {
    toggleFavorite({
      id: anime.id,
      title: anime.title || anime.name || "Unknown",
      poster_path: anime.poster_path,
    });
  };

  const handlePlayClick = () => {
    if (onPlayClick) {
      onPlayClick(anime);
    }
  };

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const releaseDate = anime.release_date || anime.first_air_date || "N/A";
  const genreNames = anime.genres?.map((g) => g.name).join(", ") || "N/A";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg neon-border neon-glow bg-gradient-to-b from-slate-900 to-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-purple-500/50 hover:bg-purple-500 text-white rounded-full transition-all duration-200"
        >
          <X size={24} />
        </button>

        {/* Backdrop Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={getBackdropUrl(anime.backdrop_path)}
            alt={anime.title || anime.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        </div>

        {/* Content */}
        <div className="relative px-6 py-6 -mt-24">
          <div className="flex gap-6 mb-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={getPosterUrl(anime.poster_path)}
                alt={anime.title || anime.name}
                className="w-32 h-48 object-cover rounded-lg neon-border neon-glow"
              />
            </div>

            {/* Title and Actions */}
            <div className="flex-1 flex flex-col justify-end">
              <h2 className="text-3xl font-bold text-white mb-2 gradient-text">
                {anime.title || anime.name}
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-cyan-400 text-sm font-semibold">
                  ★ {anime.vote_average.toFixed(1)}/10
                </span>
                <span className="text-white/60 text-sm">{releaseDate}</span>
                {anime.status && (
                  <span className="text-purple-400 text-sm">{anime.status}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePlayClick}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 transform hover:scale-105"
                >
                  <Play size={18} fill="currentColor" />
                  Watch Now
                </button>

                <button
                  onClick={handleFavoriteClick}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isFav
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                      : "bg-white/10 text-white hover:bg-purple-500/50"
                  }`}
                >
                  <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                </button>

                <button
                  onClick={handleShare}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isShared
                      ? "bg-cyan-500 text-white"
                      : "bg-white/10 text-white hover:bg-cyan-500/50"
                  }`}
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white/5 rounded-lg neon-border">
            {anime.number_of_seasons && (
              <div>
                <p className="text-white/60 text-sm">Seasons</p>
                <p className="text-cyan-400 font-bold">{anime.number_of_seasons}</p>
              </div>
            )}
            {anime.number_of_episodes && (
              <div>
                <p className="text-white/60 text-sm">Episodes</p>
                <p className="text-cyan-400 font-bold">{anime.number_of_episodes}</p>
              </div>
            )}
            {anime.episode_run_time && anime.episode_run_time[0] && (
              <div>
                <p className="text-white/60 text-sm flex items-center gap-1">
                  <Clock size={14} /> Duration
                </p>
                <p className="text-cyan-400 font-bold">{anime.episode_run_time[0]}m</p>
              </div>
            )}
            <div>
              <p className="text-white/60 text-sm flex items-center gap-1">
                <Calendar size={14} /> Year
              </p>
              <p className="text-cyan-400 font-bold">{releaseDate.split("-")[0]}</p>
            </div>
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="mb-6">
              <p className="text-white/60 text-sm mb-2">Genres</p>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm border border-purple-500/50"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Overview */}
          <div className="mb-6">
            <p className="text-white/60 text-sm mb-2">Synopsis</p>
            <p className="text-white/80 text-sm leading-relaxed">{anime.overview}</p>
          </div>

          {/* Cast */}
          {anime.cast && anime.cast.length > 0 && (
            <div>
              <p className="text-white/60 text-sm mb-3 flex items-center gap-2">
                <Users size={16} /> Cast
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {anime.cast.slice(0, 10).map((actor) => (
                  <div key={actor.id} className="text-center">
                    {actor.profile_path && (
                      <img
                        src={getPosterUrl(actor.profile_path)}
                        alt={actor.name}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    )}
                    <p className="text-white text-xs font-semibold truncate">
                      {actor.name}
                    </p>
                    <p className="text-white/60 text-xs truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
