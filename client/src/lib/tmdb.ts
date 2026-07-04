const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  console.error(
    "VITE_TMDB_API_KEY is not set. Add it to .env at the project root (see .env.example)."
  );
}
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

export interface AnimeItem {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: "tv" | "movie";
  popularity: number;
  imdb_id?: string;
  original_language?: string;
}

export interface AnimeDetail extends AnimeItem {
  genres: Array<{ id: number; name: string }>;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  created_by?: Array<{ id: number; name: string }>;
  cast?: Array<{ id: number; name: string; character: string; profile_path: string | null }>;
  seasons?: Array<{ season_number: number; episode_count: number; name: string }>;
  imdb_id?: string;
}

export interface SearchResult {
  results: AnimeItem[];
  page: number;
  total_pages: number;
  total_results: number;
}

// Anime genre ID in TMDB (Animation = 16)
const ANIME_GENRE_ID = 16;

// TMDB's `original_language` field is how we tell real Japanese anime
// apart from Western/other cartoons that also carry the Animation genre.
const JAPANESE_LANGUAGE_CODE = "ja";

export type ContentType = "all" | "anime" | "cartoon";

export interface AnimeFilters {
  contentType: ContentType;
  genres: number[];
  year: number | null;
  minRating: number;
  sortBy: "popularity.desc" | "vote_average.desc" | "first_air_date.desc" | "name.asc";
  hideAdultContent: boolean;
}

export const DEFAULT_FILTERS: AnimeFilters = {
  contentType: "all",
  genres: [],
  year: null,
  minRating: 0,
  sortBy: "popularity.desc",
  hideAdultContent: true,
};

export function hasActiveFilters(filters: AnimeFilters): boolean {
  return (
    filters.contentType !== DEFAULT_FILTERS.contentType ||
    filters.genres.length > 0 ||
    filters.year !== null ||
    filters.minRating > 0 ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.hideAdultContent !== DEFAULT_FILTERS.hideAdultContent
  );
}

// TMDB's TV `adult`/`include_adult` fields don't actually flag explicit anime (verified: both
// true and false return identical results, and explicit titles come back with adult=false).
// TMDB's community-maintained keywords are the only reliable signal, so hiding adult content
// means excluding titles tagged with these.
const ADULT_CONTENT_KEYWORD_IDS = [
  198385, // hentai
  195669, // ecchi
  285672, // etchi
  256466, // erotic
  281741, // nudity
  329280, // sexual content
  337946, // uncensored
];

async function fetchKeywordIds(id: number): Promise<number[]> {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/${id}/keywords?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return (data.results || []).map((k: { id: number }) => k.id);
  } catch {
    return [];
  }
}

// TMDB's search endpoint doesn't return keywords inline, so hiding adult content from text
// search results requires a follow-up per-title keyword lookup.
async function excludeAdultContent(items: AnimeItem[]): Promise<AnimeItem[]> {
  const keywordLists = await Promise.all(items.map((item) => fetchKeywordIds(item.id)));
  return items.filter(
    (_, i) => !keywordLists[i].some((id) => ADULT_CONTENT_KEYWORD_IDS.includes(id))
  );
}

function matchesContentType(item: { original_language?: string }, contentType: ContentType): boolean {
  if (contentType === "anime") return item.original_language === JAPANESE_LANGUAGE_CODE;
  if (contentType === "cartoon") return item.original_language !== JAPANESE_LANGUAGE_CODE;
  return true;
}

// Applied to every default browse list (Home's trending/popular/top-rated rows included) so
// adult/explicit titles are hidden everywhere by default, not just when filters are opened.
function withAdultSafeguard(params: URLSearchParams): URLSearchParams {
  params.set("include_adult", "false");
  params.set("without_keywords", ADULT_CONTENT_KEYWORD_IDS.join(","));
  return params;
}

// Fetch trending anime - using discover endpoint with animation genre
export async function getTrendingAnime(page = 1): Promise<SearchResult> {
  try {
    const params = withAdultSafeguard(
      new URLSearchParams({
        api_key: TMDB_API_KEY,
        with_genres: String(ANIME_GENRE_ID),
        page: String(page),
        sort_by: "popularity.desc",
      })
    );
    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${params.toString()}`);
    const data = await response.json();

    return {
      results: data.results.map((item: any) => ({
        ...item,
        media_type: "tv",
      })),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

// Fetch popular anime
export async function getPopularAnime(page = 1): Promise<SearchResult> {
  try {
    const params = withAdultSafeguard(
      new URLSearchParams({
        api_key: TMDB_API_KEY,
        with_genres: String(ANIME_GENRE_ID),
        page: String(page),
        sort_by: "popularity.desc",
      })
    );
    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${params.toString()}`);
    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({
        ...item,
        media_type: "tv",
      })),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error fetching popular anime:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

// Fetch top rated anime
export async function getTopRatedAnime(page = 1): Promise<SearchResult> {
  try {
    const params = withAdultSafeguard(
      new URLSearchParams({
        api_key: TMDB_API_KEY,
        with_genres: String(ANIME_GENRE_ID),
        page: String(page),
        sort_by: "vote_average.desc",
        "vote_count.gte": "100",
      })
    );
    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${params.toString()}`);
    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({
        ...item,
        media_type: "tv",
      })),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error fetching top rated anime:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

// Fetch anime by genre (Animation = 16)
export async function getAnimeByGenre(genreId: number = 16, page = 1): Promise<SearchResult> {
  try {
    const params = withAdultSafeguard(
      new URLSearchParams({
        api_key: TMDB_API_KEY,
        with_genres: String(genreId),
        page: String(page),
        sort_by: "popularity.desc",
      })
    );
    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${params.toString()}`);
    const data = await response.json();
    return {
      results: data.results.map((item: any) => ({
        ...item,
        media_type: "tv",
      })),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error fetching anime by genre:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

// Search anime - filter for animation genre, then apply any extra criteria client-side
// (TMDB's search endpoint doesn't support genre/language/year/rating filters directly).
export async function searchAnime(
  query: string,
  page = 1,
  filters?: AnimeFilters
): Promise<SearchResult> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await response.json();

    let animeResults = (data.results || []).filter((item: any) =>
      item.genre_ids?.includes(ANIME_GENRE_ID)
    );

    if (filters) {
      animeResults = animeResults.filter((item: any) => {
        if (!matchesContentType(item, filters.contentType)) return false;
        if (filters.genres.length && !filters.genres.every((g) => item.genre_ids?.includes(g))) {
          return false;
        }
        if (filters.year && !(item.first_air_date || "").startsWith(String(filters.year))) {
          return false;
        }
        if (filters.minRating > 0 && (item.vote_average || 0) < filters.minRating) return false;
        return true;
      });
    }

    let results: AnimeItem[] = animeResults.map((item: any) => ({
      ...item,
      media_type: "tv",
    }));

    if (filters?.hideAdultContent) {
      results = await excludeAdultContent(results);
    }

    return {
      results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error searching anime:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

// Browse anime by criteria (genres, content type, year, rating, sort order) without a text query.
export async function discoverAnime(filters: AnimeFilters, page = 1): Promise<SearchResult> {
  try {
    const genres = [ANIME_GENRE_ID, ...filters.genres.filter((g) => g !== ANIME_GENRE_ID)];
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page: String(page),
      sort_by: filters.sortBy,
      with_genres: genres.join(","),
    });

    if (filters.contentType === "anime") {
      params.set("with_original_language", JAPANESE_LANGUAGE_CODE);
    }
    if (filters.year) {
      params.set("first_air_date_year", String(filters.year));
    }
    if (filters.minRating > 0) {
      params.set("vote_average.gte", String(filters.minRating));
      params.set("vote_count.gte", "20");
    }
    if (filters.hideAdultContent) {
      withAdultSafeguard(params);
    }

    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?${params.toString()}`);
    const data = await response.json();

    // TMDB has no "language is not X" operator, so cartoons (non-Japanese animation)
    // are filtered out client-side after fetching.
    let results: AnimeItem[] = (data.results || []).map((item: any) => ({
      ...item,
      media_type: "tv" as const,
    }));
    if (filters.contentType === "cartoon") {
      results = results.filter((item) => matchesContentType(item, "cartoon"));
    }

    return {
      results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error discovering anime:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

// Fetch anime details with IMDb ID
export async function getAnimeDetails(id: number, mediaType: "tv" | "movie" = "tv"): Promise<AnimeDetail | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids`
    );
    const data = await response.json();

    // Extract IMDb ID from external_ids
    const imdbId = data.external_ids?.imdb_id || null;

    return {
      ...data,
      media_type: mediaType,
      imdb_id: imdbId,
      cast: data.credits?.cast?.slice(0, 10) || [],
    };
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
}

// Get image URL
export function getPosterUrl(path: string | null, size = "w500"): string {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `${IMAGE_BASE_URL}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) return "https://via.placeholder.com/1280x720?text=No+Image";
  return `${BACKDROP_BASE_URL}${path}`;
}

// Get genres
export async function getGenres(): Promise<Array<{ id: number; name: string }>> {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

// Get streaming embed URL from IMDb ID
export function getStreamingUrl(imdbId: string | undefined | null): string {
  if (!imdbId) {
    console.warn("No IMDb ID available for streaming");
    return "";
  }

  // Format: https://streamimdb.ru/embed/tv/tt9335498
  return `https://streamimdb.ru/embed/tv/${imdbId}`;
}

// Extract IMDb ID from external IDs
export function extractImdbId(externalIds: any): string | null {
  return externalIds?.imdb_id || null;
}
