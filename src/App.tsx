import './App.css'
import WeatherDashboard from './components/weather-dashboard'
import { WeatherProvider } from './context/WeatherContext'

function App() {
  return (
    <WeatherProvider>
      <div>
        <WeatherDashboard />
      </div>
    </WeatherProvider>
  )
}

export default App
