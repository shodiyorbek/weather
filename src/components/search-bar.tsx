"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, AlertTriangle } from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import { debounce } from "@/lib/utils";
import cities from "../assets/cities/worldcities.json";

interface City {
  city: string;
  country: string;
  lat: number;
  lng: number;
  population:number
}

export default function SearchBar() {
  const [inputValue, setInputValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const { dispatch } = useWeather();

  // Filter data with useMemo()
  const filteredData = React.useMemo(() => {
    if (!inputValue.trim()) return [];
  
    const lowerInput = inputValue.toLowerCase();
    return (cities as City[])
      .filter(item =>
        item.population > 1000000 &&
        item.city.toLowerCase().includes(lowerInput)
      )
      .slice(0, 10);
  }, [inputValue]);
  
  // Create a memoized debounced function
  const debouncedSetSuggestions = React.useCallback(
    debounce(async () => {
      setSuggestions(filteredData);
      return filteredData;
    }, 300),
    [filteredData]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedSetSuggestions();
    if (!showSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (city: City) => {
    setInputValue(city.city);
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
    dispatch({ type: "CHANGE_CITY", payload: city.city });
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    if (inputValue.trim() === "") {
      setSuggestions((cities as City[]).slice(0, 10));
      setError(null);
    }else{
        setSuggestions(filteredData)
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full md:max-w-md" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for a city..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="pl-10 pr-10 py-2 text-base"
          aria-haspopup="listbox"
          aria-expanded={showSuggestions}
          aria-controls="city-suggestions-list"
        />
      </div>
      {showSuggestions && (
        <Card
          className="absolute z-10 mt-1 w-full shadow-lg"
          id="city-suggestions-list"
          role="listbox">
          <CardContent className="p-2 max-h-60 overflow-y-auto">
            {error && (
              <div className="p-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
            {!error &&
              suggestions.length === 0 &&
              inputValue.trim() !== "" && (
                <p className="p-2 text-sm text-gray-500">No cities found.</p>
              )}
            {!error &&
              suggestions.map((city, index) => (
                <div
                  key={`${city.city}-${city.country}-${index}`}
                  role="option"
                  aria-selected={false}
                  className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm"
                  onClick={() => handleSuggestionClick(city)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {city.city}, {city.country}
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
