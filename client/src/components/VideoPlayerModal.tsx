import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimeDetail, getStreamingUrl } from "@/lib/tmdb";

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
  const [showSidebar, setShowSidebar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Prevent new tab opens and external navigation
  useEffect(() => {
    if (!isOpen) return;

    // Override window.open to prevent new tabs
    const originalOpen = window.open;
    window.open = function() {
      console.warn("Opening new tabs is disabled in the player");
      return null;
    };

    // Prevent right-click context menu that might allow opening in new tab
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === "anime-player" || target.closest("#anime-player")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.open = originalOpen;
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isOpen]);

  if (!isOpen || !anime) return null;

  const streamingUrl = getStreamingUrl(anime.imdb_id);

  if (!streamingUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Streaming URL not available</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Detect when user pauses the video via mouse movement
  const handleMouseMove = () => {
    setShowSidebar(true);
    // Auto-hide sidebar after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      setShowSidebar(false);
    }, 3000);
    return () => clearTimeout(timeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") {
      // Space bar toggles play/pause
      setIsPlaying(!isPlaying);
      setShowSidebar(!isPlaying); // Show sidebar when paused
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Main Player Container */}
      <div className="w-full h-full flex">
        {/* Video Player - Full width when sidebar is hidden */}
        <div className={`transition-all duration-300 ${showSidebar ? "w-2/3" : "w-full"}`}>
          <div className="w-full h-full bg-black flex items-center justify-center">
            {/* Streamimdb Embed - Sandboxed to prevent external navigation */}
            <iframe
              id="anime-player"
              src={streamingUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-presentation allow-autoplay"
              title={anime.title || anime.name || "Anime Player"}
            />
          </div>
        </div>

        {/* Info Sidebar - Only visible when paused or on mouse move */}
        {showSidebar && (
          <div className="w-1/3 bg-gradient-to-b from-slate-900/95 to-black border-l border-orange-600/40 overflow-y-auto">
            {/* Anime Info */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-orange-400 mb-2">
                  {anime.title || anime.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-600/30 text-orange-300 rounded-full text-sm font-semibold">
                    {anime.vote_average.toFixed(1)} ⭐
                  </span>
                  {anime.status && (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
                      {anime.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div>
                <h3 className="text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wider border-b border-orange-600/30 pb-2">
                  Synopsis
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {anime.overview || "No description available"}
                </p>
              </div>

              {/* Episodes & Seasons */}
              {(anime.number_of_episodes || anime.number_of_seasons) && (
                <div className="grid grid-cols-2 gap-4">
                  {anime.number_of_episodes && (
                    <div className="bg-orange-600/20 border border-orange-500/40 rounded-lg p-3">
                      <p className="text-orange-400 text-xs font-semibold uppercase">Episodes</p>
                      <p className="text-white text-lg font-bold">
                        {anime.number_of_episodes}
                      </p>
                    </div>
                  )}
                  {anime.number_of_seasons && (
                    <div className="bg-orange-600/20 border border-orange-500/40 rounded-lg p-3">
                      <p className="text-orange-400 text-xs font-semibold uppercase">Seasons</p>
                      <p className="text-white text-lg font-bold">
                        {anime.number_of_seasons}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wider border-b border-orange-600/30 pb-2">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-xs font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Release Date */}
              {(anime.release_date || anime.first_air_date) && (
                <div>
                  <h3 className="text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wider border-b border-orange-600/30 pb-2">
                    Release Date
                  </h3>
                  <p className="text-white/70">
                    {anime.release_date || anime.first_air_date}
                  </p>
                </div>
              )}

              {/* Created By */}
              {anime.created_by && anime.created_by.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
                    Created By
                  </h3>
                  <p className="text-white/70">
                    {anime.created_by.map((creator) => creator.name).join(", ")}
                  </p>
                </div>
              )}

              {/* Cast */}
              {anime.cast && anime.cast.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                    Cast
                  </h3>
                  <div className="space-y-2">
                    {anime.cast.slice(0, 5).map((actor) => (
                      <div key={actor.id} className="text-sm">
                        <p className="text-white font-medium">{actor.name}</p>
                        <p className="text-white/50 text-xs">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/50 text-xs">
                  🔒 <strong>Protected:</strong> External links and new tabs are blocked for your safety
                </p>
              </div>

              {/* Controls Hint */}
              <div className="pt-2">
                <p className="text-white/50 text-xs">
                  💡 <strong>Tip:</strong> Press SPACE to pause/play, ESC to close
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pause Hint - Show when sidebar is hidden */}
      {!showSidebar && (
        <div className="absolute bottom-4 left-4 text-white/50 text-sm">
          Move mouse or press SPACE to show info
        </div>
      )}
    </div>
  );
}
