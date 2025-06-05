"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"
import type { Forecast } from "@/types"
import { useTheme } from "@/hooks/useTheme"

interface WeatherChartProps {
  forecastData: Forecast[]
  units: "metric" | "imperial"
  isLoading: boolean
}

export default function WeatherChart({ forecastData, units, isLoading }: WeatherChartProps) {
  const { theme } = useTheme()
  const unitSymbol = units === "metric" ? "°C" : "°F"

  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Temperature Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!forecastData || forecastData.length === 0) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">No chart data available</p>
        </CardContent>
      </Card>
    )
  }

  const temperatures = forecastData.map((item) => Math.round(item.temp))
  const minTemp = Math.min(...temperatures)
  const maxTemp = Math.max(...temperatures)
  const tempRange = maxTemp - minTemp === 0 ? 10 : maxTemp - minTemp

  const chartWidth = 600
  const chartHeight = 300
  const padding = 50
  const pointRadius = 6

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (temperatures.length - 1 || 1)
  const getY = (temp: number) => chartHeight - padding - ((temp - minTemp) / tempRange) * (chartHeight - 2 * padding)

  const pathData = temperatures
    .map((temp, index) => {
      const x = getX(index)
      const y = getY(temp)
      return `${index === 0 ? "M" : "L"} ${x},${y}`
    })
    .join(" ")

  // Create gradient path for area fill
  const areaPath = `${pathData} L ${getX(temperatures.length - 1)},${chartHeight - padding} L ${padding},${
    chartHeight - padding
  } Z`

  // Theme-dependent colors
  const isDark = theme === "dark"
  const gridLineColor = isDark ? "rgba(100, 116, 139, 0.3)" : "rgba(203, 213, 225, 0.5)"
  const labelColor = isDark ? "rgb(148, 163, 184)" : "rgb(100, 116, 139)"
  const lineStrokeColor = isDark ? "rgb(56, 189, 248)" : "rgb(14, 165, 233)"
  const pointFillColor = isDark ? "rgb(14, 165, 233)" : "rgb(2, 132, 199)"
  const pointTextColor = isDark ? "rgb(203, 213, 225)" : "rgb(71, 85, 105)"

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Temperature Trend ({unitSymbol})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full overflow-x-auto"
        >
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[600px]"
            style={{ height: "300px" }}
            aria-labelledby="chart-title chart-desc"
            role="img"
          >
            <defs>
              <linearGradient id="temperatureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={lineStrokeColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={lineStrokeColor} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <title id="chart-title">5-Day Temperature Forecast</title>
            <desc id="chart-desc">Line chart showing temperature trends over the next 5 days</desc>

            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const temp = minTemp + (i * tempRange) / 4
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={padding}
                    y1={getY(temp)}
                    x2={chartWidth - padding}
                    y2={getY(temp)}
                    stroke={gridLineColor}
                    strokeDasharray="2,2"
                    aria-hidden="true"
                  />
                  <text
                    x={padding - 8}
                    y={getY(temp) + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill={labelColor}
                    aria-hidden="true"
                  >
                    {Math.round(temp)}
                    {unitSymbol}
                  </text>
                </g>
              )
            })}

            {/* X-axis labels */}
            {forecastData.map((item, index) => (
              <text
                key={`x-label-${index}`}
                x={getX(index)}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill={labelColor}
                aria-hidden="true"
              >
                {new Date(item.date * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </text>
            ))}

            {/* Area fill */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              d={areaPath}
              fill="url(#temperatureGradient)"
            />

            {/* Temperature line */}
            {temperatures.length > 1 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 1.2, ease: "easeInOut" }}
                d={pathData}
                fill="none"
                stroke={lineStrokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                role="graphics-symbol"
                aria-label="Temperature trend line"
              />
            )}

            {/* Data points */}
            {temperatures.map((temp, index) => (
              <motion.g
                key={`point-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                role="graphics-symbol"
                aria-label={`${temp}${unitSymbol} on day ${index + 1}`}
              >
                <circle
                  cx={getX(index)}
                  cy={getY(temp)}
                  r={pointRadius}
                  fill={pointFillColor}
                  stroke="white"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                <text
                  x={getX(index)}
                  y={getY(temp) - 12}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={pointTextColor}
                  aria-hidden="true"
                >
                  {temp}
                  {unitSymbol}
                </text>
              </motion.g>
            ))}
          </svg>
        </motion.div>
      </CardContent>
    </Card>
  )
}
