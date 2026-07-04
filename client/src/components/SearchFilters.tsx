import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimeFilters, ContentType, DEFAULT_FILTERS } from "@/lib/tmdb";
import { Switch } from "@/components/ui/switch";

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AnimeFilters;
  onApply: (filters: AnimeFilters) => void;
}

const CONTENT_TYPES: Array<{ value: ContentType; label: string }> = [
  { value: "all", label: "All" },
  { value: "anime", label: "Japanese Anime" },
  { value: "cartoon", label: "Cartoons" },
];

const CONTENT_TYPE_HINT: Record<ContentType, string> = {
  all: "Shows every title, anime and Western/other cartoons alike.",
  anime: "Only titles originally produced in Japanese.",
  cartoon: "Everything animated that isn't Japanese anime.",
};

// TMDB's TV genre list differs from its movie genre list (e.g. no standalone
// Action/Adventure/Fantasy/Horror/Romance ids) - these must match /genre/tv/list.
const GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 9648, name: "Mystery" },
  { id: 10762, name: "Kids" },
  { id: 37, name: "Western" },
];

const SORT_OPTIONS: Array<{ value: AnimeFilters["sortBy"]; label: string }> = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "first_air_date.desc", label: "Newest" },
  { value: "name.asc", label: "A-Z" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1959 }, (_, i) => CURRENT_YEAR - i);

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-150 border ${
        active
          ? "bg-orange-600 border-orange-600 text-black"
          : "bg-transparent border-white/15 text-white/70 hover:border-white/40 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function SearchFilters({ isOpen, onClose, filters, onApply }: SearchFiltersProps) {
  const [draft, setDraft] = useState<AnimeFilters>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const toggleGenre = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      genres: prev.genres.includes(id)
        ? prev.genres.filter((g) => g !== id)
        : [...prev.genres, id],
    }));
  };

  const activeCount =
    draft.genres.length +
    (draft.contentType !== "all" ? 1 : 0) +
    (draft.year ? 1 : 0) +
    (draft.minRating > 0 ? 1 : 0) +
    (draft.hideAdultContent !== DEFAULT_FILTERS.hideAdultContent ? 1 : 0);

  const handleClear = () => setDraft(DEFAULT_FILTERS);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#141414] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-extrabold text-white uppercase tracking-widest">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          {/* Content Type */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3">
              Content Type
            </h3>
            <div className="flex rounded-full bg-white/5 p-1">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDraft((prev) => ({ ...prev, contentType: type.value }))}
                  className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-colors duration-150 ${
                    draft.contentType === type.value
                      ? "bg-orange-600 text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-3">{CONTENT_TYPE_HINT[draft.contentType]}</p>
          </div>

          {/* Adult Content */}
          <div className="flex items-center justify-between gap-4 py-4 border-y border-white/10">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Hide Adult / Explicit Content</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Filters out titles tagged as hentai, ecchi, or otherwise explicit
                </p>
              </div>
            </div>
            <Switch
              checked={draft.hideAdultContent}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, hideAdultContent: checked }))
              }
              className="data-[state=checked]:bg-orange-600 shrink-0"
            />
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3">
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Chip
                  key={genre.id}
                  active={draft.genres.includes(genre.id)}
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                </Chip>
              ))}
            </div>
          </div>

          {/* Year + Rating */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3">
                Release Year
              </h3>
              <select
                value={draft.year ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    year: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="" className="bg-[#141414]">
                  Any year
                </option>
                {YEARS.map((year) => (
                  <option key={year} value={year} className="bg-[#141414]">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3">
                Minimum Rating{draft.minRating > 0 ? ` — ${draft.minRating.toFixed(1)}+` : ""}
              </h3>
              <input
                type="range"
                min={0}
                max={9}
                step={0.5}
                value={draft.minRating}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, minRating: Number(e.target.value) }))
                }
                className="w-full accent-orange-600 mt-4"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3">
              Sort By
            </h3>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  active={draft.sortBy === option.value}
                  onClick={() => setDraft((prev) => ({ ...prev, sortBy: option.value }))}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-white/10">
          <div className="text-white/40 text-xs uppercase tracking-wide font-bold">
            {activeCount > 0 ? `${activeCount} filter${activeCount !== 1 ? "s" : ""} active` : "No filters applied"}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="px-5 py-2.5 text-white/60 hover:text-white text-sm font-bold uppercase tracking-wide transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="px-8 py-2.5 bg-orange-600 hover:bg-orange-500 text-black rounded-md font-extrabold text-sm uppercase tracking-wide transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
