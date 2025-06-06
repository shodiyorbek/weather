import type { Country } from '@/types';
import { useEffect, useState } from 'react';



const CACHE_KEY = 'countries';
const CACHE_EXPIRATION_MS = 1000 * 60 * 60 * 24*30*6; // 6 months
const API_KEY = "48f11d4800msh474130b088c903dp19c70bjsnf6fc515f8973"
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

        const response = await fetch('https://wft-geo-db.p.rapidapi.com/v1/geo/cities?minPopulation=1000000',{
          headers:{
            'x-rapidapi-host':'wft-geo-db.p.rapidapi.com',
            'x-rapidapi-key':API_KEY
          }
        }); 
        console.log("pixel",response)
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
