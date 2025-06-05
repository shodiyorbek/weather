"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MapPin, Navigation } from "lucide-react"
import type { WeatherData } from "@/types"

interface WeatherHeroProps {
  weatherData: WeatherData | null
  units: "metric" | "imperial"
  isLoading: boolean
  onToggleFavorite: () => void
  isFavorite: boolean
}

export default function WeatherHero({ weatherData, units, isLoading, onToggleFavorite, isFavorite }: WeatherHeroProps) {
  const unitSymbol = units === "metric" ? "°C" : "°F"

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-0 shadow-xl">
          <CardContent className="p-8">
            <Skeleton className="h-8 w-48 bg-white/20 mb-4" />
            <Skeleton className="h-6 w-32 bg-white/20 mb-8" />
            <Skeleton className="h-20 w-40 bg-white/20" />
          </CardContent>
        </Card>
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-700/50">
          <CardContent className="p-8">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-400 to-slate-600 border-0 shadow-xl">
          <CardContent className="p-8 text-center text-white">
            <p className="text-xl">No weather data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const gradientClass = getWeatherGradient(weatherData.icon)
  const backgroundImage = getCityBackground(weatherData.city)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Main Weather Card */}
      <Card className={`relative overflow-hidden ${gradientClass} border-0 shadow-2xl`}>
        {/* Background Image Overlay */}
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />

        {/* Weather Pattern */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <CardContent className="relative p-8 text-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {new Date(weatherData.dt * 1000).toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </h2>
              <p className="text-lg opacity-90 mb-4">
                {new Date(weatherData.dt * 1000).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-4 w-4" />
                <span className="text-lg font-medium">
                  {weatherData.city}, {weatherData.country}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Weather Info */}
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex items-baseline gap-1 mb-2"
              >
                <span className="text-7xl font-light">{Math.round(weatherData.temperature)}</span>
                <span className="text-3xl font-light opacity-80">{unitSymbol}</span>
              </motion.div>
              <p className="text-xl capitalize font-medium opacity-90">{weatherData.description}</p>
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-6xl"
            >
              {getWeatherEmoji(weatherData.icon)}
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Details Card */}
      <Card className="bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-700/50 text-white">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6 text-white">Weather Details</h3>

          <div className="space-y-6">
            {/* Precipitation */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white/90">Temperatur (max)</span>
              <span className="text-2xl font-bold">0%</span>
            </div>

            {/* Humidity */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white/90">HUMIDITY</span>
              <span className="text-2xl font-bold">{weatherData.humidity}%</span>
            </div>

            {/* Wind */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-white/90">WIND</span>
              <span className="text-2xl font-bold">
                {weatherData.windSpeed.toFixed(1)} {units === "metric" ? "km/h" : "mph"}
              </span>
            </div>
          </div>

          {/* Change Location Button */}
        
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getWeatherGradient(iconCode: string): string {
  const gradients: { [key: string]: string } = {
    "01d": "bg-gradient-to-br from-orange-400 via-yellow-500 to-orange-600", // Clear day
    "01n": "bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900", // Clear night
    "02d": "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600", // Partly cloudy day
    "02n": "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900", // Partly cloudy night
    "03d": "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600", // Cloudy day
    "03n": "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900", // Cloudy night
    "04d": "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700", // Overcast day
    "04n": "bg-gradient-to-br from-slate-800 via-slate-900 to-black", // Overcast night
    "09d": "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700", // Rain day
    "09n": "bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900", // Rain night
    "10d": "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600", // Light rain day
    "10n": "bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900", // Light rain night
    "11d": "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800", // Thunderstorm day
    "11n": "bg-gradient-to-br from-purple-900 via-indigo-900 to-black", // Thunderstorm night
    "13d": "bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400", // Snow day
    "13n": "bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900", // Snow night
    "50d": "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500", // Mist day
    "50n": "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800", // Mist night
  }
  return gradients[iconCode] || "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
}

function getCityBackground(city: string): string | null {
  const cityBackgrounds: { [key: string]: string } = {
    Paris: "/placeholder.svg?height=400&width=600",
    London: "/placeholder.svg?height=400&width=600",
    "New York": "/placeholder.svg?height=400&width=600",
    Tokyo: "/placeholder.svg?height=400&width=600",
    Sydney: "/placeholder.svg?height=400&width=600",
  }
  return cityBackgrounds[city] || null
}

function getWeatherEmoji(iconCode: string): string {
  const iconMap: { [key: string]: string } = {
    "01d": "☀️",
    "01n": "🌙",
    "02d": "⛅",
    "02n": "☁️",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌦️",
    "10n": "🌧️",
    "11d": "⛈️",
    "11n": "⛈️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
  }
  return iconMap[iconCode] || "🌤️"
}
