//@ts-ignore
import type { WeatherState, WeatherAction } from '../types/weather';

const initialState: WeatherState = {
  city: '',
  weatherData: null,
  unit:'metric',
  refreshRate:30,
  displayMode: 'detailed',
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
      case 'CHANGE_DISPLAY_MODE':
        return {
          ...state,
          displayMode: action.payload,
        };
        case 'CHANGE_REFRESH_RATE':
          return {
            ...state,
            refreshRate: action.payload,
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