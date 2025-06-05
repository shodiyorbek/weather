"use client"

import type React from "react"

import { useState, useEffect, useCallback, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import DynamicGreeting from "@/components/dynamic-greeting"
import WeatherHero from "@/components/weather-hero"
import WeatherStats from "@/components/weather-stats"
import HourlyForecast from "@/components/hourly-forecast"
import HourlyWeatherChart from "@/components/hourly-weather-chart"
import WeeklyForecast from "@/components/weekly-forecast"
import WeatherChart from "@/components/weather-chart"
import WeatherMap from "@/components/weather-map"
import SettingsPanel from "@/components/settings-panel"
import { fetchWeatherData, getMockWeatherData, getCurrentLocation } from "@/lib/weather-service"
import type { WeatherData, Forecast, Settings, LocationQuery } from "@/types"
import {
  Cloud,
  Search,
  SettingsIcon,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Navigation,
  Moon,
  Star,
  Clock,
} from "lucide-react"
import { useCountries } from "@/hooks/useCountries"

const API_KEY = "dbc72188a31efff986da84ae5abe5acb"
const POPULAR_CITIES = [
  "New York",
  "London",
  "Tokyo",
  "Paris",
  "Sydney",
  "Dubai",
  "Singapore",
  "Los Angeles",
  "Mumbai",
  "Berlin",
]

// Default settings
const defaultSettings: Settings = {
  units: "metric",
  refreshRate: 30,
  displayMode: "detailed",
}

export default function WeatherDashboard() {
  // Core state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<Forecast[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const {loading, error: countriesError, countries} = useCountries()
  const [timeZone, setTimeZone]=useState<number>(0)
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<LocationQuery>("New York")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(["New York", "London", "Tokyo"])

  // Settings state
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [activeView, setActiveView] = useState<"overview" | "hourly" | "weekly">("overview")
  const formatTime =(unixTime: number, timezoneOffset: number): string=> {
    const utcDate = new Date(unixTime * 1000);

    // Convert offset (seconds) to IANA time zone name (approx)
    const offsetHours = timezoneOffset / 3600;
    const timeZone = `Etc/GMT${offsetHours <= 0 ? '+' + Math.abs(offsetHours) : '-' + offsetHours}`;
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
      hour12: true,
      timeZone,
    }).format(utcDate);
  }
  const getWindDirection = (deg: number): string => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  }
  const loadWeatherData = useCallback(async (location: LocationQuery, currentSettings: Settings) => {
    setIsLoading(true)
    setError(null)

    try {
      let data
      if (API_KEY) {
        try {
          data = await fetchWeatherData(location, currentSettings.units, API_KEY)
        } catch (apiError) {
          console.warn("API call failed, falling back to mock data:", apiError)
          const cityForMock = typeof location === "string" ? location : "Demo City"
          data = getMockWeatherData(cityForMock, currentSettings.units)
          setError(`Demo mode: ${apiError instanceof Error ? apiError.message : "API unavailable"}`)
        }
      } else {
        const cityForMock = typeof location === "string" ? location : "Demo City"
        data = getMockWeatherData(cityForMock, currentSettings.units)
        setError("Demo mode: Add your OpenWeatherMap API key for live data")
      }

      if (data && data.list && data.list.length > 0) {
        // Set current weather
        const currentWeatherData: WeatherData = {
          city: data.city.name,
          country: data.city.country,
          temperature: data.list[0].main.temp,
          description: data.list[0].weather[0].description,
          icon: data.list[0].weather[0].icon,
          humidity: data.list[0].main.humidity,
          windSpeed: data.list[0].wind.speed,
          dt: data.list[0].dt,
          timezone: data.city.timezone,
          sunrise: formatTime(data.city.sunrise, data.city.timezone ),
          sunset: formatTime(data.city.sunset, data.city.timezone),
          direction: getWindDirection(data.list[0].wind.deg),
          visibility: data.list[0].visibility/1000,
          pressure: data.list[0].main.pressure
        }
        setTimeZone(data.city.timezone)
        setWeatherData(currentWeatherData)

        // Process hourly forecast (next 24 hours)
        const hourlyData = data.list.slice(0, 24).map((item: any) => ({
          time: item.dt,
          temp: item.main.temp,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        }))
        setHourlyForecast(hourlyData)

        // Process daily forecast (5 days)
        const dailyForecasts: Forecast[] = []
        const forecastDays = new Set<string>()

        data.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString()
          if (!forecastDays.has(date) && dailyForecasts.length < 5) {
            forecastDays.add(date)
            dailyForecasts.push({
              date: item.dt,
              temp: item.main.temp,
              description: item.weather[0].description,
              icon: item.weather[0].icon,
              temp_min: item.main.temp_min,
              temp_max: item.main.temp_max,
            })
          }
        })

        setForecast(dailyForecasts)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Failed to load weather data:", err)
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to load weather data: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-detect location on first load
  useEffect(() => {
    const detectUserLocation = async () => {
      setIsDetectingLocation(true)
      try {
        const location = await getCurrentLocation()
        console.log("Detected location:", location)
        setSelectedLocation(location)
        await loadWeatherData(location, settings)
      } catch (error) {
        console.warn("Location detection failed:", error)
        await loadWeatherData(selectedLocation, settings)
      } finally {
        setIsDetectingLocation(false)
      }
    }

    detectUserLocation()
  }, [])

  // Refresh data when location or settings change
  useEffect(() => {
    if (!isDetectingLocation) {
      loadWeatherData(selectedLocation, settings)
    }
  }, [selectedLocation, settings, loadWeatherData, isDetectingLocation])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSelectedLocation(searchQuery.trim())
      setSearchQuery("")
    }
  }

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true)
    try {
      const location = await getCurrentLocation()
      setSelectedLocation(location)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to detect location")
    } finally {
      setIsDetectingLocation(false)
    }
  }

  const toggleFavorite = (city: string) => {
    setFavorites(
      (prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city].slice(0, 5)), // Max 5 favorites
    )
  }

  const handleRefresh = () => {
    loadWeatherData(selectedLocation, settings)
  }

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative  z-10">
        {/* Header */}
        <header className="sticky  top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-6 justify-between md:w-fit w-full">
                <div className="block">
                  <DynamicGreeting timeZone={timeZone} />
                </div>
                {/* Action bar for mobile */}
                <div className="md:hidden flex ">
                <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                >
                  {isDetectingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>

                <ThemeToggleButton />
              </div>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                  <Input
                    type="text"
                    placeholder="Search for a city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-700/50"
                  />
                </div>
              </form>

              {/* Actions */}
              <div className=" items-center gap-2 hidden md:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                >
                  {isDetectingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>

                <ThemeToggleButton />
              </div>
            </div>

           

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-4 p-1 bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
              {[
                { id: "overview", label: "Overview", icon: Cloud },
                { id: "hourly", label: "Hourly", icon: Clock },
                { id: "weekly", label: "Weekly", icon: Moon },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeView === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex-1 ${
                    activeView === tab.id
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 pt-4"
            >
              <Alert className="bg-amber-50/90 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {activeView === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Favorites */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    Favorites:
                  </span>
                  {favorites.map((city) => (
                    <Badge
                      key={city}
                      variant="secondary"
                      className="cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 whitespace-nowrap"
                      onClick={() => setSelectedLocation(city)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {city}
                    </Badge>
                  ))}
                </div>

                {/* Hero Section - Main Weather Cards */}
                <WeatherHero
                  weatherData={weatherData}
                  units={settings.units}
                  isLoading={isLoading || isDetectingLocation}
                  onToggleFavorite={() => weatherData && toggleFavorite(`${weatherData.city}, ${weatherData.country}`)}
                  isFavorite={weatherData ? favorites.includes(`${weatherData.city}, ${weatherData.country}`) : false}
                />

                {/* Hourly Weather Chart - New Feature */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Hourly Forecast
                  </h3>
                  <HourlyWeatherChart
                    hourlyData={hourlyForecast}
                    units={settings.units}
                    isLoading={isLoading || isDetectingLocation}
                  />
                </div>

                {/* 4-Day Forecast */}
                <WeeklyForecast
                  forecastData={forecast}
                  units={settings.units}
                  isLoading={isLoading || isDetectingLocation}
                  detailed={false}
                />

                {/* Secondary Grid - Stats and Chart */}
                <div className="grid grid-cols-1  gap-6">
                  <WeatherStats
                    weatherData={weatherData}
                    units={settings.units}
                    isLoading={isLoading || isDetectingLocation}
                  />
                  <WeatherChart
                    forecastData={forecast}
                    units={settings.units}
                    isLoading={isLoading || isDetectingLocation}
                  />
                </div>
              </motion.div>
            )}

            {activeView === "hourly" && (
              <motion.div
                key="hourly"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <HourlyWeatherChart
                  hourlyData={hourlyForecast}
                  units={settings.units}
                  isLoading={isLoading || isDetectingLocation}
                />
                <HourlyForecast
                  hourlyData={hourlyForecast}
                  units={settings.units}
                  isLoading={isLoading || isDetectingLocation}
                />
              </motion.div>
            )}

            {activeView === "weekly" && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <WeeklyForecast
                  forecastData={forecast}
                  units={settings.units}
                  isLoading={isLoading || isDetectingLocation}
                  detailed={true}
                />
              </motion.div>
            )}


          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowSettings(false)}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <SettingsPanel
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    onClose={() => setShowSettings(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {lastUpdated && <p>Last updated: {lastUpdated.toLocaleString()} • Data provided by OpenWeatherMap</p>}
        </footer>
      </div>
    </div>
  )
}
