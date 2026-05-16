const TMDB_API_KEY = "ddaaebb03ba0333fcb74817e89268bb1";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
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
}

export interface SearchResult {
  results: AnimeItem[];
  page: number;
  total_pages: number;
  total_results: number;
}

// Fetch trending anime
export async function getTrendingAnime(page = 1): Promise<SearchResult> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`
    );
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
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`
    );
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
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
    );
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

// Fetch anime by genre
export async function getAnimeByGenre(genreId: number, page = 1): Promise<SearchResult> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`
    );
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

// Search anime
export async function searchAnime(query: string, page = 1): Promise<SearchResult> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await response.json();
    return {
      results: data.results
        .filter((item: any) => item.media_type === "tv" || item.media_type === "movie")
        .map((item: any) => ({
          ...item,
          media_type: item.media_type || "tv",
        })),
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error searching anime:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

// Fetch anime details
export async function getAnimeDetails(id: number, mediaType: "tv" | "movie" = "tv"): Promise<AnimeDetail | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );
    const data = await response.json();
    return {
      ...data,
      media_type: mediaType,
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

// Get streaming embed URL
export function getStreamingUrl(id: number): string {
  return `https://streamimdb.ru/embed/tv/tt${String(id).padStart(7, "0")}`;
}
