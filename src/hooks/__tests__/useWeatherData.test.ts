import { renderHook, act } from '@testing-library/react'
import { useWeatherData } from '../useWeatherData'
import { useWeather } from '@/context/WeatherContext'
import { fetchWeatherData, getCurrentLocation } from '@/lib/weather-service'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the dependencies
vi.mock('@/context/WeatherContext')
vi.mock('@/lib/weather-service', () => ({
  fetchWeatherData: vi.fn(),
  getCurrentLocation: vi.fn()
}))

// Mock environment variable
const mockApiKey = 'test-api-key'
vi.stubEnv('VITE_OPENWEATHERMAP_API_KEY', mockApiKey)

describe('useWeatherData', () => {
  // Mock data
  const mockWeatherData = {
    city: {
      name: 'New York',
      country: 'US',
      timezone: -14400,
      sunrise: 1234567890,
      sunset: 1234567890
    },
    list: [
      {
        dt: 1234567890,
        main: {
          temp: 20,
          temp_min: 18,
          temp_max: 22,
          humidity: 65,
          pressure: 1013
        },
        weather: [
          {
            description: 'clear sky',
            icon: '01d'
          }
        ],
        wind: {
          speed: 5,
          deg: 180
        },
        visibility: 10000
      }
    ]
  }

  const mockLocation = {
    cityForMock: 'New York',
    lat: 40.7128,
    lon: -74.0060
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Mock useWeather context
    ;(useWeather as any).mockReturnValue({
      state: {
        city: 'New York',
        unit: 'metric',
        error: null
      },
      dispatch: vi.fn()
    })

    // Mock fetchWeatherData
    ;(fetchWeatherData as any).mockResolvedValue(mockWeatherData)

    // Mock getCurrentLocation
    ;(getCurrentLocation as any).mockResolvedValue(mockLocation)
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWeatherData())

    expect(result.current.forecast).toEqual([])
    expect(result.current.hourlyForecast).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.lastUpdated).toBeNull()
    expect(result.current.timeZone).toBe(0)
    expect(result.current.isDetectingLocation).toBe(false)
  })

  it('should load weather data successfully', async () => {
    const { result } = renderHook(() => useWeatherData())

    await act(async () => {
      await result.current.loadWeatherData('New York', {
        units: 'metric',
        refreshRate: 30,
        displayMode: 'detailed'
      })
    })

    expect(fetchWeatherData).toHaveBeenCalledWith('New York', 'metric', mockApiKey)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.forecast.length).toBeGreaterThan(0)
    expect(result.current.hourlyForecast.length).toBeGreaterThan(0)
    expect(result.current.lastUpdated).toBeInstanceOf(Date)
  })

  it('should handle API key missing error', async () => {
    // Clear the API key
    vi.stubEnv('VITE_OPENWEATHERMAP_API_KEY', '')
    
    // Mock fetchWeatherData to reject with an error
    ;(fetchWeatherData as any).mockRejectedValue(new Error('API key is not configured'))
    
    const { result } = renderHook(() => useWeatherData())

    await act(async () => {
      await result.current.loadWeatherData('New York', {
        units: 'metric',
        refreshRate: 30,
        displayMode: 'detailed'
      })
    })

    const { dispatch } = useWeather()
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: expect.stringContaining('Failed to load weather data')
    })
  })

  it('should handle fetch weather data error', async () => {
    const error = new Error('Failed to fetch weather data')
    ;(fetchWeatherData as any).mockRejectedValue(error)

    const { result } = renderHook(() => useWeatherData())

    await act(async () => {
      await result.current.loadWeatherData('New York', {
        units: 'metric',
        refreshRate: 30,
        displayMode: 'detailed'
      })
    })

    const { dispatch } = useWeather()
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: expect.stringContaining('Failed to load weather data')
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('should detect user location successfully', async () => {
    const { result } = renderHook(() => useWeatherData())

    await act(async () => {
      await result.current.detectUserLocation()
    })

    expect(getCurrentLocation).toHaveBeenCalledWith(mockApiKey)
    expect(result.current.isDetectingLocation).toBe(false)
  })

  it('should handle location detection error', async () => {
    const error = new Error('Failed to detect location')
    ;(getCurrentLocation as any).mockRejectedValue(error)

    const { result } = renderHook(() => useWeatherData())

    await act(async () => {
      await result.current.detectUserLocation()
    })

    const { dispatch } = useWeather()
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: expect.stringContaining('Failed to detect location')
    })
    expect(result.current.isDetectingLocation).toBe(false)
  })

  it('should refresh weather data', async () => {
    const { result } = renderHook(() => useWeatherData())

    // First load the weather data
    await act(async () => {
      await result.current.loadWeatherData('New York', {
        units: 'metric',
        refreshRate: 30,
        displayMode: 'detailed'
      })
    })

    // Clear the mock to verify the refresh call
    vi.clearAllMocks()

    // Then refresh
    await act(async () => {
      await result.current.handleRefresh()
    })

    expect(fetchWeatherData).toHaveBeenCalledWith('New York', 'metric', mockApiKey)
  })
}) 