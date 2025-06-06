# Weather App

A modern weather application built with React and TypeScript that provides real-time weather information, forecasts, and location-based weather updates.

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
   npm install
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

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
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
