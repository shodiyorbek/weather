"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Wind, Droplets, Eye, Thermometer, Gauge, Sunrise, Sunset, Navigation } from "lucide-react"
import type { WeatherData } from "@/types"

interface WeatherStatsProps {
  weatherData: WeatherData | null
  units: "metric" | "imperial"
  isLoading: boolean
}

export default function WeatherStats({ weatherData, units, isLoading }: WeatherStatsProps) {
  const windSpeedUnit = units === "metric" ? "m/s" : "mph"

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!weatherData) {
    return null
  }

  const stats = [
    {
      icon: Wind,
      label: "Wind Speed",
      value: `${weatherData.windSpeed.toFixed(1)} ${windSpeedUnit}`,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: `${weatherData.humidity.toFixed(2)}%`,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Eye,
      label: "Visibility",
      value: `${weatherData.visibility} km`,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: Thermometer,
      label: "Feels Like",
      value: `${Math.round(weatherData.temperature + (Math.random() * 4 - 2))}°${units === "metric" ? "C" : "F"}`,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      icon: Gauge,
      label: "Pressure",
      value: `${weatherData.pressure} hPa`,
      color: "text-indigo-500",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      icon: Navigation,
      label: "Wind Direction",
      value: weatherData.direction,
      color: "text-teal-500",
      bgColor: "bg-teal-100 dark:bg-teal-900/30",
    },
    {
      icon: Sunrise,
      label: "Sunrise",
      value: weatherData.sunrise,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      icon: Sunset,
      label: "Sunset",
      value: weatherData.sunset,
      color: "text-pink-500",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
