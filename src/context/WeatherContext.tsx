import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
//@ts-ignore
import type { WeatherState, WeatherAction } from '../types/weather';
import { weatherReducer, initialState } from '../lib/weatherReducer';

interface WeatherContextType {
  state: WeatherState;
  dispatch: React.Dispatch<WeatherAction>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  // Wrap dispatch with logging
  const wrappedDispatch = useCallback((action: WeatherAction) => {
    console.log('Dispatching action:', action);
    dispatch(action);
  }, []);

  return (
    <WeatherContext.Provider value={{ state, dispatch: wrappedDispatch }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
} 