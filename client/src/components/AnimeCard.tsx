import { Heart, Play } from "lucide-react";
import { AnimeItem, getPosterUrl } from "@/lib/tmdb";
import { useFavorites } from "@/hooks/useLocalStorage";
import { useState } from "react";

interface AnimeCardProps {
  anime: AnimeItem;
  onSelect: (anime: AnimeItem) => void;
  onPlayClick?: (anime: AnimeItem) => void;
}

export default function AnimeCard({ anime, onSelect, onPlayClick }: AnimeCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);
  const isFav = isFavorite(anime.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: anime.id,
      title: anime.title || anime.name || "Unknown",
      poster_path: anime.poster_path,
    });
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayClick) {
      onPlayClick(anime);
    }
  };

  return (
    <div
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(anime)}
    >
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-lg neon-border neon-glow transition-all duration-300 h-full">
        {/* Poster Image */}
        <img
          src={getPosterUrl(anime.poster_path)}
          alt={anime.title || anime.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content Overlay */}
        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* Top Section - Favorite Button */}
            <div className="flex justify-end">
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isFav
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/50"
                    : "bg-white/20 text-white hover:bg-orange-600/50"
                }`}
              >
                <Heart size={20} fill={isFav ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Bottom Section - Info and Play */}
            <div className="space-y-3">
              {/* Title and Rating */}
              <div>
                <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                  {anime.title || anime.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 text-xs font-semibold">
                    ★ {anime.vote_average.toFixed(1)}
                  </span>
                  <span className="text-white/60 text-xs">
                    {anime.release_date || anime.first_air_date || "N/A"}
                  </span>
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlayClick}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-200 transform hover:scale-105"
              >
                <Play size={16} fill="currentColor" />
                Watch Now
              </button>
            </div>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg shadow-orange-500/50">
          {anime.vote_average.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
