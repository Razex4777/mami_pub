import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'mami_pub_favorites';

interface FavoritesContextType {
  favorites: string[]; // Array of product IDs
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Load favorites from localStorage
const loadFavoritesFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading favorites from storage:', error);
  }
  return [];
};

// Save favorites to localStorage
const saveFavoritesToStorage = (favorites: string[]) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to storage:', error);
  }
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(loadFavoritesFromStorage);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    saveFavoritesToStorage(favorites);
  }, [favorites]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId);
  }, [favorites]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const addFavorite = useCallback((productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev : [...prev, productId]
    );
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites(prev => prev.filter(id => id !== productId));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
