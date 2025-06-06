"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import DynamicGreeting from "@/components/dynamic-greeting"
import WeatherHero from "@/components/weather-hero"
import WeatherStats from "@/components/weather-stats"
import HourlyForecast from "@/components/hourly-forecast"
import HourlyWeatherChart from "@/components/hourly-weather-chart"
import WeeklyForecast from "@/components/weekly-forecast"
import WeatherChart from "@/components/weather-chart"
import SettingsPanel from "@/components/settings-panel"
import type { Settings } from "@/types"
import { useWeather } from "@/context/WeatherContext"
import { useFavoriteCities } from '@/hooks/useFavoriteCities'
import { useWeatherData } from '@/hooks/useWeatherData'
import {
  Cloud,
  SettingsIcon,
  RefreshCw,
  Loader2,
  Navigation,
  Moon,
  Star,
  Clock,
} from "lucide-react"
import ErrorBoundry from "./error-boundry"
import SiteTour from '@/components/site-tour'
import SearchBar from "./search-bar"




export default function WeatherDashboard() {
  const { state, dispatch } = useWeather();
  const { favoriteCities, addFavoriteCity, removeFavoriteCity, isFavoriteCity } = useFavoriteCities();
  const [isCurrentCityFavorite, setIsCurrentCityFavorite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState<"overview" | "forecast" | "statistic">("overview");

  const {
    forecast,
    hourlyForecast,
    isLoading,
    lastUpdated,
    timeZone,
    isDetectingLocation,
    loadWeatherData,
    detectUserLocation,
    handleDetectLocation,
    handleRefresh,
    tempratureInfo
  } = useWeatherData();

  // Initial location detection
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);
  useEffect(()=>{
    handleRefresh()
  },[state.unit,state.displayMode])

  // Load weather data when city changes
  useEffect(() => {
    if (state.city) {
      console.log("Loading weather for city:", state.city);
      loadWeatherData(state.city, {
        units: state.unit,
        refreshRate: state.refreshRate,
        displayMode: state.displayMode});
    }
  }, [state.city,  loadWeatherData]);

  // Check if current city is favorite
  useEffect(() => {
    if (state.weatherData) {
      isFavoriteCity(state.weatherData.city, state.weatherData.country)
        .then(setIsCurrentCityFavorite);
    }
  }, [state.weatherData, isFavoriteCity]);

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    console.log("Settings changed:", newSettings);
    dispatch({ type: "TOGGLE_UNIT", payload: newSettings.units });
  dispatch({ type: "CHANGE_DISPLAY_MODE", payload: newSettings.displayMode });
    dispatch({ type: "CHANGE_REFRESH_RATE", payload: newSettings.refreshRate });

    setShowSettings(false);
  };

  const toggleFavorite = async (city: string, country: string) => {
    if (isCurrentCityFavorite) {
      await removeFavoriteCity(city, country);
    } else {
      await addFavoriteCity(city, country);
    }
    setIsCurrentCityFavorite(!isCurrentCityFavorite);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500">
      <SiteTour />
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-6 justify-between md:w-fit w-full">
                <div className="block">
                  <DynamicGreeting timeZone={timeZone} />
                </div>
                {/* Action bar for mobile */}
                <div className="md:hidden flex">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="location-button bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
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
                      className="settings-button bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </Button>

                    <ThemeToggleButton />
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <SearchBar/>

              {/* Actions */}
              <div className="items-center gap-2 hidden md:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="location-button bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
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
                  className="settings-button bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>

                <ThemeToggleButton />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-4 p-1 bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
              {[
                { id: "overview", label: "Current weather", icon: Cloud },
                { id: "forecast", label: "Forecast", icon: Clock },
                { id: "statistic", label: "Statistic", icon: Moon },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeView === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex-1 ${
                    activeView === tab.id
                      ? "bg-white dark:bg-slate-700 text-black hover:bg-black/10 shadow-sm"
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
        <ErrorBoundry />

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
                <div className="flex items-center gap-2 overflow-x-auto pb-2 favorites-section">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    Favorites:
                  </span>
                  {favoriteCities.map(({ city, country }) => (
                    <Badge
                      key={`${city}-${country}`}
                      variant="secondary"
                      className="cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-700/90 whitespace-nowrap"
                      onClick={() => dispatch({ type: 'CHANGE_CITY', payload: city })}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {city}
                    </Badge>
                  ))}
                </div>

                {/* Hero Section - Main Weather Cards */}
                <div className="weather-hero">
                  <WeatherHero
                  displayMode={state.displayMode}
                  //@ts-ignore
                    tempratureInfo={tempratureInfo}
                    weatherData={state.weatherData}
                    units={state.unit}
                    isLoading={isLoading || isDetectingLocation}
                    onToggleFavorite={() => state.weatherData && toggleFavorite(state.weatherData.city, state.weatherData.country)}
                    isFavorite={isCurrentCityFavorite}
                  />
                </div>

                {/* Hourly Weather Chart */}
                <div className="hourly-forecast">
                  <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Hourly Forecast
                  </h3>
                  <HourlyWeatherChart
                    hourlyData={hourlyForecast}
                    units={state.unit}
                    isLoading={isLoading || isDetectingLocation}
                  />
                </div>

                {/* Weekly Forecast */}
                <div className="weekly-forecast">
                  <WeeklyForecast
                    forecastData={forecast}
                    units={state.unit}
                    isLoading={isLoading || isDetectingLocation}
                    detailed={false}
                  />
                </div>

                {/* Secondary Grid - Stats and Chart */}
                <div className="flex flex-col gap-6">
                  <WeatherStats
                    weatherData={state.weatherData}
                    units={state.unit}
                    isLoading={isLoading || isDetectingLocation}
                  />
                  <WeatherChart
                    forecastData={forecast}
                    units={state.unit}
                    isLoading={isLoading || isDetectingLocation}
                  />
                </div>
              </motion.div>
            )}

            {activeView === "forecast" && (
              <motion.div
                key="hourly"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
               
                <HourlyForecast
                  hourlyData={hourlyForecast}
                  units={state.unit}
                  isLoading={isLoading || isDetectingLocation}
                />
                 <WeeklyForecast
                  forecastData={forecast}
                  units={state.unit}
                  isLoading={isLoading || isDetectingLocation}
                  detailed={true}
                />
              </motion.div>
            )}

            {activeView === "statistic" && (
              <motion.div
                key="statistic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HourlyWeatherChart
                  hourlyData={hourlyForecast}
                  units={state.unit}
                  isLoading={isLoading || isDetectingLocation}
                />
                <div className="mt-2">
                <WeatherChart
                    forecastData={forecast}
                    units={state.unit}
                    isLoading={isLoading || isDetectingLocation}
                  /></div>
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
                    settings={
                      {
                        units: state.unit,
                        displayMode: state.displayMode,
                        refreshRate: state.refreshRate

                      }
                    }
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