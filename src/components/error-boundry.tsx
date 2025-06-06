import { AnimatePresence, motion } from 'framer-motion'
import { Alert, AlertDescription } from './ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useWeather } from '@/context/WeatherContext';

const ErrorBoundry = () => {
  const { state, dispatch } = useWeather();

  return (
    <AnimatePresence>
    {state.error && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="container mx-auto px-4 pt-4"
      >
        <Alert onClick={() => dispatch({ type: 'CLEAR_ERROR' })} className="bg-amber-50/90 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">{state.error}</AlertDescription>
        </Alert>
      </motion.div>
    )}
  </AnimatePresence>
  )
}

export default ErrorBoundry