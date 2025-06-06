import { WeatherProvider } from '@/context/WeatherContext'
import WeatherDashboard from '@/components/weather-dashboard'

function App() {
  return (
      <WeatherProvider>
        <WeatherDashboard />
      </WeatherProvider>
  )
}

export default App
