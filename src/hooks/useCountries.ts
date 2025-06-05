import type { Country } from '@/types';
import { useEffect, useState } from 'react';



const CACHE_KEY = 'countries';
const CACHE_EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 hours

export function useCountries() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const timestamp = localStorage.getItem(`${CACHE_KEY}-timestamp`);
        const isValidCache = cached && timestamp && Date.now() - +timestamp < CACHE_EXPIRATION_MS;

        if (isValidCache) {
          setCountries(JSON.parse(cached!));
          setLoading(false);
          return;
        }

        const response = await fetch('https://countriesnow.space/api/v0.1/countries/capital'); 
        if (!response.ok) throw new Error('Failed to fetch countries');

        const data: Country[] = await response.json();
        setCountries(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(`${CACHE_KEY}-timestamp`, String(Date.now()));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
}
