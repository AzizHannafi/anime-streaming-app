import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface GenreFilterProps {
  selectedGenres: number[];
  onGenresChange: (genres: number[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Common anime genres with their TMDB IDs
const ANIME_GENRES = [
  { id: 16, name: "Animation", icon: "🎬" },
  { id: 28, name: "Action", icon: "⚔️" },
  { id: 12, name: "Adventure", icon: "🗺️" },
  { id: 35, name: "Comedy", icon: "😂" },
  { id: 80, name: "Crime", icon: "🔍" },
  { id: 18, name: "Drama", icon: "🎭" },
  { id: 10751, name: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: 14, name: "Fantasy", icon: "🧙" },
  { id: 36, name: "History", icon: "📚" },
  { id: 27, name: "Horror", icon: "👻" },
  { id: 10402, name: "Music", icon: "🎵" },
  { id: 9648, name: "Mystery", icon: "🔎" },
  { id: 10749, name: "Romance", icon: "💕" },
  { id: 878, name: "Sci-Fi", icon: "🚀" },
  { id: 10770, name: "TV Movie", icon: "📺" },
  { id: 53, name: "Thriller", icon: "😨" },
  { id: 10765, name: "Sci-Fi & Fantasy", icon: "✨" },
  { id: 10759, name: "Action & Adventure", icon: "🎯" },
];

export default function GenreFilter({
  selectedGenres,
  onGenresChange,
  isOpen,
  onClose,
}: GenreFilterProps) {
  const [tempSelectedGenres, setTempSelectedGenres] = useState<number[]>(selectedGenres);

  useEffect(() => {
    setTempSelectedGenres(selectedGenres);
  }, [selectedGenres]);

  const toggleGenre = (genreId: number) => {
    setTempSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleApply = () => {
    onGenresChange(tempSelectedGenres);
    onClose();
  };

  const handleClear = () => {
    setTempSelectedGenres([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <h2 className="text-2xl font-bold text-cyan-400">Filter by Genre</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Genre Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ANIME_GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 font-semibold text-left ${
                  tempSelectedGenres.includes(genre.id)
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20"
                    : "bg-slate-800/50 border-slate-700 text-white/70 hover:border-cyan-500/50 hover:bg-slate-800"
                }`}
              >
                <span className="text-lg mr-2">{genre.icon}</span>
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-cyan-500/20 bg-slate-950/50">
          <div className="text-white/60 text-sm">
            {tempSelectedGenres.length > 0 && (
              <span>
                {tempSelectedGenres.length} genre{tempSelectedGenres.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
