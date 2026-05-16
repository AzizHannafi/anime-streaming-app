import { X, Volume2, Maximize, Settings } from "lucide-react";
import { AnimeDetail, getStreamingUrl } from "@/lib/tmdb";
import { useState } from "react";

interface VideoPlayerModalProps {
  anime: AnimeDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayerModal({
  anime,
  isOpen,
  onClose,
}: VideoPlayerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!isOpen || !anime) return null;

  const streamingUrl = getStreamingUrl(anime.id);

  const handleFullscreen = () => {
    const playerElement = document.getElementById("anime-player");
    if (playerElement) {
      if (!document.fullscreenElement) {
        playerElement.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 p-2 bg-purple-500/50 hover:bg-purple-500 text-white rounded-full transition-all duration-200 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <X size={24} />
        </button>

        {/* Video Player Container */}
        <div
          id="anime-player"
          className="relative w-full h-full bg-black flex items-center justify-center"
        >
          {/* Iframe Embed */}
          <iframe
            src={streamingUrl}
            title={anime.title || anime.name}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />

          {/* Player Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Title and Info */}
            <div className="mb-4">
              <h3 className="text-white font-bold text-lg">
                {anime.title || anime.name}
              </h3>
              <p className="text-white/60 text-sm">
                {anime.number_of_seasons && `${anime.number_of_seasons} Seasons`}
                {anime.number_of_episodes && ` • ${anime.number_of_episodes} Episodes`}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="p-2 bg-white/10 hover:bg-cyan-500/50 text-white rounded-lg transition-all duration-200">
                  <Volume2 size={20} />
                </button>
                <button className="p-2 bg-white/10 hover:bg-cyan-500/50 text-white rounded-lg transition-all duration-200">
                  <Settings size={20} />
                </button>
              </div>

              <button
                onClick={handleFullscreen}
                className="p-2 bg-white/10 hover:bg-cyan-500/50 text-white rounded-lg transition-all duration-200"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar (Desktop) */}
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-slate-900 to-transparent p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h4 className="text-white/60 text-sm mb-2">Now Playing</h4>
              <p className="text-white font-bold">{anime.title || anime.name}</p>
            </div>

            {anime.overview && (
              <div>
                <h4 className="text-white/60 text-sm mb-2">Synopsis</h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {anime.overview}
                </p>
              </div>
            )}

            {anime.genres && anime.genres.length > 0 && (
              <div>
                <h4 className="text-white/60 text-sm mb-2">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-purple-500/30 text-purple-300 rounded text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {anime.cast && anime.cast.length > 0 && (
              <div>
                <h4 className="text-white/60 text-sm mb-2">Cast</h4>
                <div className="space-y-2">
                  {anime.cast.slice(0, 5).map((actor) => (
                    <div key={actor.id}>
                      <p className="text-white text-sm font-semibold">
                        {actor.name}
                      </p>
                      <p className="text-white/60 text-xs">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
