import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface SavedGame {
  id: string;
  lotterySlug: string;
  numbers: number[];
  name?: string; // Optional name/description
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

const STORAGE_KEY = "cebolao_saved_games";

export function useSavedGames() {
  const [games, setGames] = useState<SavedGame[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setGames(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved games", e);
      }
    }
  }, []);

  // Save to local storage whenever games change
  const saveToStorage = (newGames: SavedGame[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGames));
    setGames(newGames);
  };

  const addGame = (game: Omit<SavedGame, "id" | "createdAt" | "isFavorite">) => {
    const newGame: SavedGame = {
      ...game,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    const newGames = [newGame, ...games];
    saveToStorage(newGames);
    toast.success("Jogo salvo com sucesso!");
    return newGame;
  };

  const updateGame = (id: string, updates: Partial<SavedGame>) => {
    const newGames = games.map((g) => (g.id === id ? { ...g, ...updates } : g));
    saveToStorage(newGames);
    toast.success("Jogo atualizado!");
  };

  const deleteGame = (id: string) => {
    const newGames = games.filter((g) => g.id !== id);
    saveToStorage(newGames);
    toast.success("Jogo removido.");
  };

  const toggleFavorite = (id: string) => {
    const game = games.find((g) => g.id === id);
    if (game) {
      updateGame(id, { isFavorite: !game.isFavorite });
    }
  };

  const getGamesByLottery = (slug: string) => {
    return games.filter((g) => g.lotterySlug === slug);
  };

  // Helper to get all unique tags
  const allTags = Array.from(new Set(games.flatMap((g) => g.tags))).sort();

  return {
    games,
    addGame,
    updateGame,
    deleteGame,
    toggleFavorite,
    getGamesByLottery,
    allTags,
  };
}
