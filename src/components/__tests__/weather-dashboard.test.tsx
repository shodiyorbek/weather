import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { act } from 'react-dom/test-utils'
import WeatherDashboard from '../weather-dashboard'
import { WeatherProvider } from '@/context/WeatherContext'

// Mock the hooks and components
vi.mock('@/hooks/useWeatherData', () => ({
  useWeatherData: () => ({
    forecast: [],
    hourlyForecast: [],
    isLoading: false,
    lastUpdated: new Date('2024-01-01'),
    timeZone: 'UTC',
    isDetectingLocation: false,
    loadWeatherData: vi.fn(),
    detectUserLocation: vi.fn(),
    handleDetectLocation: vi.fn(),
    handleRefresh: vi.fn()
  })
}))

vi.mock('@/hooks/useFavoriteCities', () => ({
  useFavoriteCities: () => ({
    favoriteCities: [],
    addFavoriteCity: vi.fn(),
    removeFavoriteCity: vi.fn(),
    isFavoriteCity: vi.fn()
  })
}))

// Mock child components
vi.mock('@/components/dynamic-greeting', () => ({
  default: () => <div data-testid="mock-dynamic-greeting">Dynamic Greeting</div>
}))

vi.mock('@/components/weather-hero', () => ({
  default: () => <div data-testid="mock-weather-hero">Weather Hero</div>
}))

vi.mock('@/components/weather-stats', () => ({
  default: () => <div data-testid="mock-weather-stats">Weather Stats</div>
}))

vi.mock('@/components/hourly-forecast', () => ({
  default: () => <div data-testid="mock-hourly-forecast">Hourly Forecast</div>
}))

vi.mock('@/components/hourly-weather-chart', () => ({
  default: () => <div data-testid="mock-hourly-weather-chart">Hourly Weather Chart</div>
}))

vi.mock('@/components/weekly-forecast', () => ({
  default: () => <div data-testid="mock-weekly-forecast">Weekly Forecast</div>
}))

vi.mock('@/components/weather-chart', () => ({
  default: () => <div data-testid="mock-weather-chart">Weather Chart</div>
}))

vi.mock('@/components/settings-panel', () => ({
  default: () => <div data-testid="mock-settings-panel">Settings Panel</div>
}))

vi.mock('@/components/site-tour', () => ({
  default: () => <div data-testid="mock-site-tour">Site Tour</div>
}))

vi.mock('@/components/search-bar', () => ({
  default: () => <div data-testid="mock-search-bar">Search Bar</div>
}))

vi.mock('@/components/error-boundry', () => ({
  default: () => <div data-testid="mock-error-boundary">Error Boundary</div>
}))

describe('WeatherDashboard', () => {
  it('should match snapshot', () => {
    const { container } = render(
        <WeatherProvider>
          <WeatherDashboard />
        </WeatherProvider>
    )
    expect(container).toMatchSnapshot()
  })

  it('should render all main components in overview view', () => {
    render(
        <WeatherProvider>
          <WeatherDashboard />
        </WeatherProvider>
    )

    // Check for components that are always visible
    expect(screen.getByTestId('mock-dynamic-greeting')).toBeInTheDocument()
    expect(screen.getByTestId('mock-weather-hero')).toBeInTheDocument()
    expect(screen.getByTestId('mock-weather-stats')).toBeInTheDocument()
    expect(screen.getByTestId('mock-hourly-weather-chart')).toBeInTheDocument()
    expect(screen.getByTestId('mock-weekly-forecast')).toBeInTheDocument()
    expect(screen.getByTestId('mock-weather-chart')).toBeInTheDocument()
    expect(screen.getByTestId('mock-site-tour')).toBeInTheDocument()
    expect(screen.getByTestId('mock-search-bar')).toBeInTheDocument()
    expect(screen.getByTestId('mock-error-boundary')).toBeInTheDocument()
  })

  it('should render hourly view components', async () => {
    render(
        <WeatherProvider>
          <WeatherDashboard />
        </WeatherProvider>
    )

    // Click the forecast tab
    const forecastTab = screen.getByRole('button', { name: /forecast/i })
    await act(async () => {
      forecastTab.click()
    })

    // Wait for the components to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('mock-hourly-forecast')).toBeInTheDocument()
      expect(screen.getByTestId('mock-weekly-forecast')).toBeInTheDocument()
    })
  })

  it('should render weekly view components', async () => {
    render(
        <WeatherProvider>
          <WeatherDashboard />
        </WeatherProvider>
    )

    // Click the statistic tab
    const statisticTab = screen.getByRole('button', { name: /statistic/i })
    await act(async () => {
      statisticTab.click()
    })

    // Wait for the components to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('mock-weekly-forecast')).toBeInTheDocument()
    })
  })
}) 