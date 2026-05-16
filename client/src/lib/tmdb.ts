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
  imdb_id?: string;
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

// Fetch trending anime - using discover endpoint with animation genre
export async function getTrendingAnime(page = 1): Promise<SearchResult> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${ANIME_GENRE_ID}&page=${page}&sort_by=popularity.desc`
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
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${ANIME_GENRE_ID}&page=${page}&sort_by=popularity.desc`
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
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${ANIME_GENRE_ID}&page=${page}&sort_by=vote_average.desc&vote_count.gte=100`
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

// Fetch anime by genre (Animation = 16)
export async function getAnimeByGenre(genreId: number = 16, page = 1): Promise<SearchResult> {
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

// Search anime - filter for animation genre
export async function searchAnime(query: string, page = 1): Promise<SearchResult> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await response.json();

    // Filter for anime - check if it has animation genre
    const animeResults = data.results.filter((item: any) => {
      const hasAnimeGenre = item.genre_ids?.includes(ANIME_GENRE_ID);
      return hasAnimeGenre;
    });

    return {
      results: animeResults.map((item: any) => ({
        ...item,
        media_type: "tv",
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
