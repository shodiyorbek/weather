"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"

interface HourlyForecastProps {
  hourlyData: any[]
  units: "metric" | "imperial"
  isLoading: boolean
}

export default function HourlyForecast({ hourlyData, units, isLoading }: HourlyForecastProps) {
  const unitSymbol = units === "metric" ? "°C" : "°F"

  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            24-Hour Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-20 flex-shrink-0" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">No hourly forecast data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          24-Hour Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {hourlyData.map((hour, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-w-[80px]"
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {new Date(hour.time * 1000).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  hour12: true,
                })}
              </p>
              <div className="text-3xl mb-2">{getWeatherEmoji(hour.icon)}</div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {Math.round(hour.temp)}
                {unitSymbol}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-1">{hour.description}</p>
            </motion.div>
          ))}
        </div>
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
