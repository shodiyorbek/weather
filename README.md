# Weather App

A modern weather application built with React and TypeScript that provides real-time weather information, forecasts, and location-based weather updates.

# Avaiable on the web
[Weather app](https://weather.shodiyorbek.uz)

## 🚀 Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Weather API**: OpenWeatherMap API
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier
- **Package Manager**: npm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher)

## 🔑 Required API Keys

1. **OpenWeatherMap API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your API key from your account dashboard
   - Create a `.env` file in the root directory
   - Add your API key:
     ```
     VITE_OPENWEATHERMAP_API_KEY=your_api_key_here
     ```

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create a `.env` file and add your API key:
   ```bash
   cp .env.example .env
   # Then edit .env and add your API key
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 🧪 Running Tests

```bash
# Run tests in watch mode
npm test

```

## 📦 Project Structure

```
weather-app/
├── src/
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and services
│   ├── types/          # TypeScript type definitions
│   └── test/           # Test setup and utilities
├── public/             # Static assets
└── tests/              # Test files
```

## 🌟 Features

- Real-time weather data
- 5-day weather forecast
- Hourly weather updates
- Location-based weather
- Temperature unit conversion (Celsius/Fahrenheit)
- Wind speed and direction
- Humidity and pressure information
- Sunrise and sunset times
- Responsive design for all devices
- Performance optimizations with debouncing and throttling
- Interactive weather charts and visualizations
- Dark/Light theme support
- Favorite cities management
- Site tour for new users

## 🔧 Performance Optimizations

### Debouncing
The application implements debouncing in several key areas to optimize performance and reduce unnecessary API calls:

1. **Search Input**
```typescript
const debouncedSearch = useDebounce(searchTerm, 500);
useEffect(() => {
  if (debouncedSearch) {
    // Perform search
  }
}, [debouncedSearch]);
```

2. **Weather Data Refresh**
```typescript
const debouncedRefresh = useDebounce(handleRefresh, 1000);
// Use debouncedRefresh for manual refresh operations
```

### Throttling
Throttling is implemented for frequent operations to ensure consistent performance:

1. **Scroll Events**
```typescript
const throttledScroll = useThrottle(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);
```

2. **Window Resize**
```typescript
const throttledResize = useThrottle(handleResize, 200);
window.addEventListener('resize', throttledResize);
```

## 🎯 Unique Project Aspects

1. **Smart Data Caching**
   - Implements a sophisticated caching system for weather data
   - Reduces API calls while maintaining data freshness
   - Handles offline scenarios gracefully

2. **Advanced Error Handling**
   - Comprehensive error boundaries
   - User-friendly error messages
   - Automatic retry mechanisms for failed API calls

3. **Dynamic Theme System**
   - Automatic theme switching based on time of day
   - Smooth transitions between themes
   - Customizable color schemes

4. **Progressive Loading**
   - Implements skeleton loading states
   - Progressive image loading
   - Smooth transitions between views

5. **Accessibility Features**
   - ARIA labels and roles
   - Keyboard navigation support
   - Screen reader compatibility
   - High contrast mode support

6. **Performance Monitoring**
   - Real-time performance metrics
   - Error tracking and reporting
   - User interaction analytics

7. **Smart Location Detection**
   - Multiple fallback methods for location detection
   - Caching of user's last known location
   - Permission handling with user-friendly prompts

8. **Responsive Design Patterns**
   - Mobile-first approach
   - Adaptive layouts for different screen sizes
   - Touch-friendly interface elements

## 🧪 Testing

The project uses Vitest and React Testing Library for testing. Tests are located in the `src/hooks/__tests__` directory.

To run tests:
```bash
npm test
```

## 📝 Code Quality

The project uses ESLint and Prettier for code quality and formatting:

```bash
# Run linting
npm run lint

# Format code
npm run format
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather API
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build tool
