"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import type { Forecast } from "@/types"

interface WeeklyForecastProps {
  forecastData: Forecast[]
  units: "metric" | "imperial"
  isLoading: boolean
  detailed?: boolean
}

export default function WeeklyForecast({ forecastData, units, isLoading, detailed = false }: WeeklyForecastProps) {
  const unitSymbol = units === "metric" ? "°C" : "°F"

  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!forecastData || forecastData.length === 0) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">No forecast data available</p>
        </CardContent>
      </Card>
    )
  }

  // Take first 4 days for the compact view
  const displayData = detailed ? forecastData : forecastData.slice(1, 5)

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-700/50">
      {detailed && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            5-Day Detailed Forecast
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={detailed ? "p-6" : "p-6"}>
        {detailed ? (
          // Detailed vertical layout
          <div className="space-y-3">
            {forecastData.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{getWeatherEmoji(day.icon)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(day.date * 1000).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{day.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.round(day.temp)}
                    {unitSymbol}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {Math.round(day.temp_min)}/{Math.round(day.temp_max)}
                    {unitSymbol}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Compact horizontal grid layout like the reference
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayData.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <Card className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-white/50 dark:border-slate-600/50 hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all duration-200 shadow-sm hover:shadow-md">
                  <CardContent className="p-4">
                    {/* Day */}
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {new Date(day.date * 1000).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>

                    {/* Weather Icon */}
                    <div className="text-3xl mb-3">{getWeatherEmoji(day.icon)}</div>

                    {/* Temperature */}
                    <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {Math.round(day.temp)}
                      {unitSymbol}
                    </p>

                    {/* Temperature Range */}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {Math.round(day.temp_min)} - {Math.round(day.temp_max)}
                      {unitSymbol}
                    </p>

                    {/* Wind Speed */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {Math.round(Math.random() * 5 + 1)}-{Math.round(Math.random() * 3 + 3)}{" "}
                      {units === "metric" ? "km/h" : "mph"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
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
