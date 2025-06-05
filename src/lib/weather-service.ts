import type { OpenWeatherAPIResponse, Settings, LocationQuery } from "@/types"
import axios from "axios"
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"
const GEOCODING_API_URL = "https://api.openweathermap.org/geo/1.0/reverse"

export async function fetchWeatherData(
  location: LocationQuery,
  units: Settings["units"],
  apiKey: string,
): Promise<OpenWeatherAPIResponse> {
  let queryParams: string
  if (typeof location === "string") {
    queryParams = `q=${encodeURIComponent(location)}`
  } else {
    queryParams = `lat=${location.lat}&lon=${location.lon}`
  }

  const url = `${API_BASE_URL}?${queryParams}&units=${units}&appid=${apiKey}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
const response = await axios.get(url)
    // const response = await fetch(url, {
    //   method: "GET",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //   },
    //   signal: controller.signal,
    // })

    clearTimeout(timeoutId)
console.log(response.data)
    if (response.data.cod!=="200") {
      if (response.status === 404) {
        throw new Error(
          `Location not found: ${typeof location === "string" ? location : `${location.lat}, ${location.lon}`}`,
        )
      }
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your OpenWeatherMap API key.")
      }
      if (response.status >= 500) {
        throw new Error("Weather service is temporarily unavailable. Please try again later.")
      }

      const errorData = await response.data
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data: OpenWeatherAPIResponse = await response.data

    if (!data || !data.list || data.list.length === 0) {
      const locationName = typeof location === "string" ? location : `coordinates ${location.lat}, ${location.lon}`
      throw new Error(`No weather data available for ${locationName}`)
    }

    return data
  } catch (error) {
    const locationName =
      typeof location === "string" ? location : `coordinates ${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout while fetching weather data for ${locationName}`)
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error(`Network error: Unable to connect to weather service. Please check your internet connection.`)
      }
      throw error
    }

    throw new Error(`Failed to fetch weather data for ${locationName}`)
  }
}

export async function getCurrentLocation(): Promise<{ lat: number; lon: number; cityForMock?: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Try to get city name from coordinates
        try {
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
          if (apiKey) {
            const response = await fetch(
              `${GEOCODING_API_URL}?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`,
            )
            if (response.ok) {
              const data = await response.json()
              if (data && data.length > 0) {
                resolve({
                  lat: latitude,
                  lon: longitude,
                  cityForMock: data[0].name,
                })
                return
              }
            }
          }
        } catch (error) {
          console.warn("Failed to get city name from coordinates:", error)
        }

        resolve({
          lat: latitude,
          lon: longitude,
          cityForMock: "Your Location",
        })
      },
      (error) => {
        let errorMessage = "Failed to get your location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }

        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}

// Mock data function for development and fallback
export function getMockWeatherData(city: string, units: Settings["units"]): OpenWeatherAPIResponse {
  console.log(`Generating mock data for ${city} with units: ${units}`)
  const tempUnit = units === "metric" ? 15 : 59
  const baseTime = Math.floor(Date.now() / 1000)

  const mockList = Array.from({ length: 40 }, (_, i) => {
    const dt = baseTime + i * 3 * 60 * 60
    const dayOffset = Math.floor(i / 8)

    return {
      dt: dt,
      main: {
        temp: tempUnit + (Math.random() * 10 - 5) + dayOffset * 0.5,
        feels_like: tempUnit + (Math.random() * 10 - 5) - 2,
        temp_min: tempUnit + (Math.random() * 5 - 5),
        temp_max: tempUnit + (Math.random() * 5 + 5),
        pressure: 1012 + (Math.random() * 10 - 5),
        sea_level: 1012,
        grnd_level: 1000,
        humidity: 60 + (Math.random() * 20 - 10),
        temp_kf: 0,
      },
      weather: [
        {
          id: i % 4 === 0 ? 800 : i % 4 === 1 ? 801 : i % 4 === 2 ? 500 : 300,
          main: i % 4 === 0 ? "Clear" : i % 4 === 1 ? "Clouds" : i % 4 === 2 ? "Rain" : "Drizzle",
          description:
            i % 4 === 0 ? "clear sky" : i % 4 === 1 ? "few clouds" : i % 4 === 2 ? "light rain" : "light drizzle",
          icon: i % 4 === 0 ? "01d" : i % 4 === 1 ? "02d" : i % 4 === 2 ? "10d" : "09d",
        },
      ],
      clouds: { all: 20 + Math.random() * 30 },
      wind: {
        speed: units === "metric" ? 3 + Math.random() * 5 : 7 + Math.random() * 10,
        deg: Math.random() * 360,
        gust: units === "metric" ? 5 + Math.random() * 7 : 12 + Math.random() * 15,
      },
      visibility: 10000,
      pop: Math.random() * 0.3,
      sys: { pod: i % 2 === 0 ? "d" : "n" },
      dt_txt: new Date(dt * 1000).toISOString().replace("T", " ").substring(0, 19),
    }
  })

  return {
    cod: "200",
    message: 0,
    cnt: mockList.length,
    list: mockList,
    city: {
      id: 12345,
      name: city,
      coord: { lat: 0, lon: 0 },
      country: "MCK",
      population: 100000,
      timezone: 0,
      sunrise: baseTime - 6 * 60 * 60,
      sunset: baseTime + 6 * 60 * 60,
    },
  }
}
