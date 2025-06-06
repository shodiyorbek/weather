import { useState, useEffect } from 'react';
import type { CallBackProps, Step } from 'react-joyride';
import { STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
  {
    target: '.search-bar',
    content: 'Search for any city to get its weather forecast',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.location-button',
    content: 'Use your current location to get local weather',
    placement: 'bottom',
  },
  {
    target: '.favorites-section',
    content: 'Add cities to your favorites for quick access',
    placement: 'bottom',
  },
  {
    target: '.weather-hero',
    content: 'View current weather conditions and toggle favorites',
    placement: 'bottom',
  },
  {
    target: '.hourly-forecast',
    content: 'Check detailed hourly weather predictions',
    placement: 'top',
  },
  {
    target: '.weekly-forecast',
    content: 'See the 5-day weather forecast',
    placement: 'top',
  },
  {
    target: '.settings-button',
    content: 'Customize your weather display preferences',
    placement: 'left',
  },
];

export function useSiteTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  const restartTour = () => {
    setRun(true);
    localStorage.removeItem('hasSeenTour');
  };

  return {
    run,
    steps: TOUR_STEPS,
    handleJoyrideCallback,
    restartTour,
  };
} 