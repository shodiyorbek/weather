export interface WeatherData {
  city: string
  country: string
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  dt: number ,
  sunrise: string,
  sunset: string,
  timezone: number,
  direction: string,
  pressure: number,
  visibility: number
}

export interface Forecast {
  date: number // timestamp
  temp: number
  temp_min: number
  temp_max: number
  description: string
  icon: string
}

export interface Settings {
  units: "metric" | "imperial"
  refreshRate: number // in minutes
  displayMode: "detailed" | "compact"
}

export type LocationQuery = string | { lat: number; lon: number; cityForMock?: string }

// Based on OpenWeatherMap API response structure for 5 day / 3 hour forecast
export interface OpenWeatherAPIResponse {
  cod: string
  message: number
  cnt: number
  list: {
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
    pop: number // Probability of precipitation
    rain?: {
      "3h": number
    }
    snow?: {
      "3h": number
    }
    sys: {
      pod: "d" | "n" // Part of day (d = day, n = night)
    }
    dt_txt: string
  }[]
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

export interface Country {
  name: string;
  capital: string;
  iso2: string;
  iso3: string;
}
