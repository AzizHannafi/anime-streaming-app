import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { AnimeItem } from "@/lib/tmdb";
import AnimeCard from "./AnimeCard";

interface AnimeCarouselProps {
  title: string;
  anime: AnimeItem[];
  isLoading?: boolean;
  onSelectAnime: (anime: AnimeItem) => void;
  onPlayClick?: (anime: AnimeItem) => void;
}

export default function AnimeCarousel({
  title,
  anime,
  isLoading,
  onSelectAnime,
  onPlayClick,
}: AnimeCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between px-2 pb-3 border-b border-orange-500/20">
        <h2 className="text-3xl font-bold gradient-text">{title}</h2>
        <div className="text-white/60 text-sm font-semibold">{anime.length} titles</div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-black to-transparent hover:from-orange-600/50 text-white rounded-r-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 h-56 bg-white/10 rounded-lg animate-pulse neon-border"
                />
              ))
            : anime.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-40 h-56">
                  <AnimeCard
                    anime={item}
                    onSelect={onSelectAnime}
                    onPlayClick={onPlayClick}
                  />
                </div>
              ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gradient-to-l from-black to-transparent hover:from-orange-600/50 text-white rounded-l-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
