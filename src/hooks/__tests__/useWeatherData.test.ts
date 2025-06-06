import { renderHook, act } from '@testing-library/react'
import { useWeatherData } from '../useWeatherData'
import { useWeather } from '@/context/WeatherContext'
import { fetchWeatherData, getCurrentLocation } from '@/lib/weather-service'

// Mock the dependencies
jest.mock('@/context/WeatherContext')
jest.mock('@/lib/weather-service')

// Mock environment variable
const mockApiKey = 'dbc72188a31efff986da84ae5abe5acb'
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
    jest.clearAllMocks()

    // Mock useWeather context
    ;(useWeather as jest.Mock).mockReturnValue({
      state: {
        city: 'New York',
        unit: 'metric',
        error: null
      },
      dispatch: jest.fn()
    })

    // Mock fetchWeatherData
    ;(fetchWeatherData as jest.Mock).mockResolvedValue(mockWeatherData)

    // Mock getCurrentLocation
    ;(getCurrentLocation as jest.Mock).mockResolvedValue(mockLocation)
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
    vi.stubEnv('VITE_OPENWEATHERMAP_API_KEY', '')
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
      payload: expect.stringContaining('API key is not configured')
    })
  })

  it('should handle fetch weather data error', async () => {
    const error = new Error('Failed to fetch weather data')
    ;(fetchWeatherData as jest.Mock).mockRejectedValue(error)

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
    ;(getCurrentLocation as jest.Mock).mockRejectedValue(error)

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

    await act(async () => {
      await result.current.handleRefresh()
    })

    expect(fetchWeatherData).toHaveBeenCalledWith('New York', 'metric', mockApiKey)
  })

  it('should format time correctly', () => {
    const { result } = renderHook(() => useWeatherData())
    const formattedTime = result.current.formatTime(1234567890, -14400)
    expect(formattedTime).toMatch(/^\d{1,2}:\d{2} [AP]M$/)
  })

  it('should get wind direction correctly', () => {
    const { result } = renderHook(() => useWeatherData())
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const direction = result.current.getWindDirection(180)
    expect(directions).toContain(direction)
  })
}) 