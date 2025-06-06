import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface FavoriteCitiesDB extends DBSchema {
  'favorite-cities': {
    key: string;
    value: {
      city: string;
      country: string;
      timestamp: number;
    };
  };
}

class FavoriteCitiesService {
  private db: IDBPDatabase<FavoriteCitiesDB> | null = null;
  private readonly DB_NAME = 'weather-app-db';
  private readonly STORE_NAME = 'favorite-cities';

  async init() {
    if (!this.db) {
      this.db = await openDB<FavoriteCitiesDB>(this.DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('favorite-cities')) {
            db.createObjectStore('favorite-cities');
          }
        },
      });
    }
    return this.db;
  }

  async addFavoriteCity(city: string, country: string): Promise<void> {
    const db = await this.init();
    const key = `${city}-${country}`;
    await db.put(this.STORE_NAME, {
      city,
      country,
      timestamp: Date.now(),
    }, key);
  }

  async removeFavoriteCity(city: string, country: string): Promise<void> {
    const db = await this.init();
    const key = `${city}-${country}`;
    await db.delete(this.STORE_NAME, key);
  }

  async getFavoriteCities(): Promise<Array<{ city: string; country: string }>> {
    const db = await this.init();
    const cities = await db.getAll(this.STORE_NAME);
    return cities.map(({ city, country }) => ({ city, country }));
  }

  async isFavoriteCity(city: string, country: string): Promise<boolean> {
    const db = await this.init();
    const key = `${city}-${country}`;
    const cityData = await db.get(this.STORE_NAME, key);
    return !!cityData;
  }
}

export const favoriteCitiesService = new FavoriteCitiesService(); 