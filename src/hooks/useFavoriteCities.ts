import { useState, useEffect, useCallback } from 'react';
import { favoriteCitiesService } from '@/lib/favorite-cities';

export function useFavoriteCities() {
  const [favoriteCities, setFavoriteCities] = useState<Array<{ city: string; country: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavoriteCities();
  }, []);

  const loadFavoriteCities = async () => {
    try {
      const cities = await favoriteCitiesService.getFavoriteCities();
      setFavoriteCities(cities);
    } catch (error) {
      console.error('Failed to load favorite cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavoriteCity = useCallback(async (city: string, country: string) => {
    try {
      await favoriteCitiesService.addFavoriteCity(city, country);
      setFavoriteCities(prev => [...prev, { city, country }]);
    } catch (error) {
      console.error('Failed to add favorite city:', error);
    }
  }, []);

  const removeFavoriteCity = useCallback(async (city: string, country: string) => {
    try {
      await favoriteCitiesService.removeFavoriteCity(city, country);
      setFavoriteCities(prev => prev.filter(c => c.city !== city || c.country !== country));
    } catch (error) {
      console.error('Failed to remove favorite city:', error);
    }
  }, []);

  const isFavoriteCity = useCallback(async (city: string, country: string) => {
    try {
      return await favoriteCitiesService.isFavoriteCity(city, country);
    } catch (error) {
      console.error('Failed to check favorite city status:', error);
      return false;
    }
  }, []);

  return {
    favoriteCities,
    isLoading,
    addFavoriteCity,
    removeFavoriteCity,
    isFavoriteCity,
  };
} 