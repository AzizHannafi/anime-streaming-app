import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export interface WatchHistoryItem {
  id: number;
  title: string;
  poster_path: string | null;
  watched_at: number;
  progress?: number;
}

export interface FavoriteItem {
  id: number;
  title: string;
  poster_path: string | null;
  added_at: number;
}

export function useWatchHistory() {
  const [history, setHistory] = useLocalStorage<WatchHistoryItem[]>("anime_watch_history", []);

  const addToHistory = (item: Omit<WatchHistoryItem, "watched_at">) => {
    const newHistory = [
      { ...item, watched_at: Date.now() },
      ...history.filter((h) => h.id !== item.id),
    ].slice(0, 50);
    setHistory(newHistory);
  };

  const removeFromHistory = (id: number) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteItem[]>("anime_favorites", []);

  const addToFavorites = (item: Omit<FavoriteItem, "added_at">) => {
    if (!favorites.find((f) => f.id === item.id)) {
      setFavorites([{ ...item, added_at: Date.now() }, ...favorites]);
    }
  };

  const removeFromFavorites = (id: number) => {
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  const isFavorite = (id: number) => {
    return favorites.some((f) => f.id === id);
  };

  const toggleFavorite = (item: Omit<FavoriteItem, "added_at">) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  return { favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite };
}
