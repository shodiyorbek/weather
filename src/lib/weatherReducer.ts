import type { WeatherState, WeatherAction } from '../types/weather';

const initialState: WeatherState = {
  city: '',
  weatherData: null,
  unit: 'metric',
  error: null,
};

export function weatherReducer(state: WeatherState, action: WeatherAction): WeatherState {
  switch (action.type) {
    case 'FETCH_WEATHER':
      return {
        ...state,
        weatherData: action.payload,
        error: null,
      };

    case 'CHANGE_CITY':
      return {
        ...state,
        city: action.payload,
      };

    case 'TOGGLE_UNIT':
      return {
        ...state,
        unit: state.unit === 'metric' ? 'imperial' : 'metric',
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

export { initialState }; 