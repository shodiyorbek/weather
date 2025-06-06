"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRef, useEffect } from "react"

interface HourlyWeatherChartProps {
  hourlyData: any[]
  units: "metric" | "imperial"
  isLoading: boolean
}

export default function HourlyWeatherChart({ hourlyData, isLoading }: HourlyWeatherChartProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      // Scroll to the beginning of the chart (left side)
      scrollContainerRef.current.scrollLeft = 0
    }
  }, [hourlyData]) // Re-run when hourlyData changes

  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-700/50">
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const chartData = hourlyData.filter((item) => item && typeof item.temp === "number")

  if (chartData.length === 0) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-700/50">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">No hourly data available</p>
        </CardContent>
      </Card>
    )
  }

  const temperatures = chartData.map((item) => Math.round(item.temp))
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)
  const tempRange = maxTemp - minTemp === 0 ? 10 : maxTemp - minTemp

  const chartHeight = 160
  const padding = 40 // Left and right padding within the SVG
  const topPadding = 40 // Space above the line for temperature labels
  const bottomPadding = 80 // Space below the line for icons and time labels

  // Calculate dynamic width for the SVG content
  const pointsToDraw = chartData.length
  const spacePerPoint = 100 // Horizontal space allocated for each data point section
  // Ensure there's enough width for at least one point's rendering if pointsToDraw is 1
  const calculatedContentWidth = pointsToDraw > 1 ? (pointsToDraw - 1) * spacePerPoint : spacePerPoint
  const finalChartWidth = Math.max(800, 2 * padding + calculatedContentWidth)

  const getX = (index: number) => padding + (index * (finalChartWidth - 2 * padding)) / (pointsToDraw - 1 || 1)
  // If pointsToDraw is 1, (pointsToDraw - 1 || 1) becomes 1. index is 0. getX(0) = padding.
  // This places the single point at the start, respecting padding.

  const getY = (temp: number) =>
    topPadding + ((maxTemp - temp) / tempRange) * (chartHeight - topPadding - bottomPadding)

  // Create smooth curve path
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return ""

    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = i + 1 < points.length ? points[i + 1] : null

      if (i === 1) {
        // First curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.3
        const cp1y = prev.y
        const cp2x = curr.x - (curr.x - prev.x) * 0.3
        const cp2y = curr.y
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`
      } else if (i === points.length - 1 || !next) {
        // Last curve
        const prevPrev = i >= 2 ? points[i - 2] : prev
        const cp1x = prev.x + (curr.x - prev.x) * 0.3
        const cp1y = prev.y
        const cp2x = curr.x - (curr.x - prevPrev.x) * 0.1
        const cp2y = curr.y
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`
      } else {
        // Middle curves
        const cp1x = prev.x + (curr.x - prev.x) * 0.3
        const cp1y = prev.y + (curr.y - prev.y) * 0.3
        const cp2x = curr.x - (next.x - prev.x) * 0.1
        const cp2y = curr.y - (next.y - prev.y) * 0.1
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`
      }
    }

    return path
  }

  const points = temperatures.map((temp, index) => ({
    x: getX(index),
    y: getY(temp),
  }))

  const smoothPath = createSmoothPath(points)

  // Coral/orange-red color like in the reference images
  const lineColor = "#FF6B6B" // Coral red color
  const pointColor = "#FF6B6B"
  const textColor = "#374151"

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/70 dark:to-slate-900/70 backdrop-blur-sm border-white/30 dark:border-slate-700/50 shadow-lg">
      <CardContent className="p-6">
        <motion.div
          ref={scrollContainerRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full overflow-x-auto pb-4"
        >
          <svg
            viewBox={`0 0 ${finalChartWidth} ${chartHeight}`}
            className="block"
            style={{
              height: `${chartHeight}px`,
              width: `${finalChartWidth}px`,
            }}
          >
            {/* Temperature line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2, duration: 1.2, ease: "easeInOut" }}
              d={smoothPath}
              fill="none"
              stroke={lineColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points and labels */}
            {temperatures.map((temp, index) => (
              <motion.g
                key={`point-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
              >
                {/* Current temperature (first point) - large circle with dotted line */}
                {index === 0 && (
                  <>
                    {/* Dotted vertical line from current temp to time label */}
                    <line
                      x1={getX(index)}
                      y1={getY(temp)}
                      x2={getX(index)}
                      y2={chartHeight - 35}
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />

                    {/* Large circle for current temperature */}
                    <circle
                      cx={getX(index)}
                      cy={getY(temp)}
                      r="18"
                      fill={pointColor}
                      stroke="white"
                      strokeWidth="3"
                      className="drop-shadow-lg"
                    />

                    {/* Current temperature text inside circle */}
                    <text
                      x={getX(index)}
                      y={getY(temp) + 6}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill="white"
                    >
                      {temp}
                    </text>
                  </>
                )}

                {/* Other temperature points - small circles */}
                {index > 0 && (
                  <>
                    <circle cx={getX(index)} cy={getY(temp)} r="6" fill={pointColor} stroke="white" strokeWidth="2" />

                    {/* Temperature labels above the points */}
                    <text
                      x={getX(index)}
                      y={getY(temp) - 15}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="600"
                      fill={pointColor}
                    >
                      {temp}
                    </text>
                  </>
                )}
              </motion.g>
            ))}

            {/* Weather icons and time labels */}
            {chartData.map((item, index) => {
              return (
                <g key={`label-${index}`}>
                  {/* Weather icon */}
                  <foreignObject x={getX(index) - 20} y={chartHeight - 75} width="40" height="30">
                    <div className="flex items-center justify-center text-2xl">{getWeatherEmoji(item.icon)}</div>
                  </foreignObject>

                  {/* Time label */}
                  <text
                    x={getX(index)}
                    y={chartHeight - 15}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight={index === 0 ? "700" : "500"}
                    fill={textColor}
                  >
                    {new Date(item.time * 1000).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </text>
                </g>
              )
            })}
          </svg>
        </motion.div>
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
