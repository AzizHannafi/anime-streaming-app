import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { AnimeItem, getPosterUrl } from "@/lib/tmdb";
import { Skeleton } from "@/components/ui/skeleton";

interface AnimeCarouselProps {
  title: string;
  items: AnimeItem[];
  isLoading?: boolean;
  onSelectAnime: (anime: AnimeItem) => void;
}

export default function AnimeCarousel({
  title,
  items,
  isLoading,
  onSelectAnime,
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
    <section className="netflix-rail">
      <div className="netflix-rail-heading">
        <h2>{title}</h2>
        <p>Curated picks, no promoted slots</p>
      </div>

      <div className="netflix-carousel">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="netflix-carousel-arrow left"
            aria-label={`Previous ${title}`}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="netflix-carousel-container"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="netflix-carousel-item">
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
              ))
            : items.map((item) => (
                <div
                  key={item.id}
                  className="netflix-carousel-item"
                  onClick={() => onSelectAnime(item)}
                >
                  <div className="netflix-poster">
                    <img
                      src={getPosterUrl(item.poster_path)}
                      alt={item.title || item.name}
                      className="netflix-poster-image"
                      loading="lazy"
                    />
                    <div className="netflix-poster-overlay" />

                    {/* Play Button */}
                    <div className="netflix-play-button">
                      <div className="netflix-play-icon">
                        <Play size={24} fill="currentColor" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="netflix-poster-info">
                      <p className="netflix-poster-title">
                        {item.title || item.name}
                      </p>
                      <p className="netflix-poster-rating">
                        ⭐ {item.vote_average?.toFixed(1) || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="netflix-carousel-arrow right"
            aria-label={`Next ${title}`}
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
}
