import type { OpenWeatherAPIResponse, Settings, LocationQuery } from "@/types"
import type { AxiosResponse } from "axios"
import axios from "axios"
import { throttle } from "./utils"

const API_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"
const GEOCODING_API_URL = "https://api.openweathermap.org/geo/1.0/reverse"

interface GeocodingResponse {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Create a throttled version of the fetch function
const throttledFetch = throttle(
  //@ts-ignore
  async (url: string): Promise<AxiosResponse> => {
    return axios.get(url)
  },
  5000 
)

interface RawWeatherItem {
  dt: number
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    sea_level: number
    grnd_level: number
    humidity: number
    temp_kf: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  clouds: {
    all: number
  }
  wind: {
    speed: number
    deg: number
    gust: number
  }
  visibility: number
  pop: number
  rain?: {
    "3h": number
  }
  snow?: {
    "3h": number
  }
  sys: {
    pod: string
  }
  dt_txt: string
}

interface RawWeatherResponse {
  cod: string
  message: number
  cnt: number
  list: RawWeatherItem[]
  city: {
    id: number
    name: string
    coord: {
      lat: number
      lon: number
    }
    country: string
    population: number
    timezone: number
    sunrise: number
    sunset: number
  }
}

export async function fetchWeatherData(
  location: LocationQuery,
  units: Settings["units"],
  apiKey: string,
): Promise<OpenWeatherAPIResponse> {
  let queryParams: string
  console.log(`Fetching weather data inside service  for ${typeof location === "string" ? location : `${location.lat}, ${location.lon}`}`)
  if (typeof location === "string") {
    queryParams = `q=${encodeURIComponent(location)}`
  } else {
    queryParams = `lat=${location.lat}&lon=${location.lon}`
  }

  const url = `${API_BASE_URL}?${queryParams}&units=${units}&appid=${apiKey}`
console.log(`Fetching weather data url for  ${url}`)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    try {
      const response:any = await throttledFetch(url)
      console.log(`Weather data response for ${response}`, response)
      clearTimeout(timeoutId)
     
      if (response.data.cod !== "200") {
        console.log("Error response:", response)
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

        const errorData = response.data
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const rawData = response.data as RawWeatherResponse
      if (!rawData || !rawData.list || !Array.isArray(rawData.list) || rawData.list.length === 0) {
        const locationName = typeof location === "string" ? location : `coordinates ${location.lat}, ${location.lon}`
        throw new Error(`No weather data available for ${locationName}`)
      }

      // Transform the data to match the expected types
      const transformedList = rawData.list.map((item: RawWeatherItem) => {
        const pod = item.sys.pod.toLowerCase()
        return {
          ...item,
          sys: {
            ...item.sys,
            pod: (pod === "d" || pod === "n") ? pod as "d" | "n" : "d"
          }
        }
      }) as OpenWeatherAPIResponse["list"]

      const data: OpenWeatherAPIResponse = {
        ...rawData,
        list: transformedList
      }

      return data
    } catch (error) {
      if (error instanceof Error && error.message.includes("Request throttled")) {
        throw error; // Re-throw throttling errors to be handled by the component
      }
      throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
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

// Create a regular geocoding function
async function geocodeLocation(latitude: number, longitude: number, apiKey: string): Promise<GeocodingResponse[] | null> {
  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`,
    )
    if (response.ok) {
      const data = await response.json() as GeocodingResponse[]
      return data
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function getCurrentLocation(apiKey: string): Promise<{ lat: number; lon: number; cityForMock?: string }> {
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
         
          if (apiKey) {
            const data = await geocodeLocation(latitude, longitude, apiKey)
            if (data && data.length > 0) {
              resolve({
                lat: latitude,
                lon: longitude,
                cityForMock: data[0].name,
              })
              return
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


