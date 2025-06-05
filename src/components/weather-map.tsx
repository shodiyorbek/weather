"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Layers } from "lucide-react"
import type { WeatherData } from "@/types"

interface WeatherMapProps {
  weatherData: WeatherData | null
  isLoading: boolean
}

export default function WeatherMap({ weatherData, isLoading }: WeatherMapProps) {
  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Weather Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-500" />
          Weather Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 to-green-900 rounded-lg overflow-hidden">
          {/* Placeholder map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-16 w-16 mx-auto text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Interactive Weather Map</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {weatherData ? `Showing weather for ${weatherData.city}` : "Weather map visualization"}
                </p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 max-w-sm">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This would integrate with mapping services like OpenLayers or Mapbox to show:
                </p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                  <li>• Temperature overlays</li>
                  <li>• Precipitation radar</li>
                  <li>• Wind patterns</li>
                  <li>• Cloud coverage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
