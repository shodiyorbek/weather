import { useState, useCallback } from "react"
import type { WeatherData, Forecast, Settings, LocationQuery } from "@/types"
import { fetchWeatherData, getCurrentLocation } from '@/lib/weather-service'
import { useWeather } from '@/context/WeatherContext'

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

export function useWeatherData() {
  const { state, dispatch } = useWeather()
  const [forecast, setForecast] = useState<Forecast[]>([])
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [timeZone, setTimeZone] = useState<number>(0)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  const formatTime = (unixTime: number, timezoneOffset: number): string => {
    const utcDate = new Date(unixTime * 1000)
    const offsetHours = timezoneOffset / 3600
    const timeZone = `Etc/GMT${offsetHours <= 0 ? '+' + Math.abs(offsetHours) : '-' + offsetHours}`
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
      hour12: true,
      timeZone,
    }).format(utcDate)
  }

  const getWindDirection = (deg: number): string => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW'
    ]
    const index = Math.round(deg / 22.5) % 16
    return directions[index]
  }

  const loadWeatherData = useCallback(async (location: LocationQuery, currentSettings: Settings) => {
    if (!location) return
    if (!API_KEY) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: "OpenWeatherMap API key is not configured. Please add your API key to continue."
      })
      return
    }

    setIsLoading(true)
    dispatch({ type: 'CLEAR_ERROR' })
    console.log("Try to load weather data for:", location)
    try {
      const data = await fetchWeatherData(location, currentSettings.units, API_KEY)
      console.log("Fetched weather data:", data)

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
          sunrise: formatTime(data.city.sunrise, data.city.timezone),
          sunset: formatTime(data.city.sunset, data.city.timezone),
          direction: getWindDirection(data.list[0].wind.deg),
          visibility: data.list[0].visibility/1000,
          pressure: data.list[0].main.pressure
        }
        setTimeZone(data.city.timezone)
        
        // Update state with new weather data
        dispatch({ type: 'FETCH_WEATHER', payload: currentWeatherData })

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
      dispatch({ type: 'SET_ERROR', payload: `Failed to load weather data: ${errorMessage}` })
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  const detectUserLocation = useCallback(async () => {
    setIsDetectingLocation(true)
    try {
      const location = await getCurrentLocation(API_KEY)
      console.log("Detected location:", location)
      if (location.cityForMock && location.cityForMock !== "Your Location") {
        dispatch({ type: 'CHANGE_CITY', payload: location.cityForMock })
      } else {
        loadWeatherData(location, { units: state.unit, refreshRate: 30, displayMode: "detailed" })
      }
    } catch (err) {
      console.error("Failed to detect location:", err)
      dispatch({
        type: 'SET_ERROR',
        payload: "Failed to detect location. Please try searching for a city instead."
      })
      dispatch({ type: 'CHANGE_CITY', payload: "New York" })
    } finally {
      setIsDetectingLocation(false)
    }
  }, [dispatch, loadWeatherData, state.unit])

  const handleDetectLocation = useCallback(async () => {
    setIsDetectingLocation(true)
    try {
      const location = await getCurrentLocation()
      if (location.cityForMock) {
        dispatch({ type: 'CHANGE_CITY', payload: location.cityForMock })
      }
      loadWeatherData(location, { units: state.unit, refreshRate: 30, displayMode: "detailed" })
    } catch (err) {
      console.error("Failed to detect location:", err)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: "Failed to detect location. Please try searching for a city instead."
      })
    } finally {
      setIsDetectingLocation(false)
    }
  }, [dispatch, loadWeatherData, state.unit])

  const handleRefresh = useCallback(() => {
    if (state.city) {
      loadWeatherData(state.city, { units: state.unit, refreshRate: 30, displayMode: "detailed" })
    }
  }, [state.city, state.unit, loadWeatherData])

  return {
    forecast,
    hourlyForecast,
    isLoading,
    lastUpdated,
    timeZone,
    isDetectingLocation,
    loadWeatherData,
    detectUserLocation,
    handleDetectLocation,
    handleRefresh
  }
}
