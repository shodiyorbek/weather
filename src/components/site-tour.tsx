"use client"

import Joyride from 'react-joyride';
import { useSiteTour } from '@/hooks/useSiteTour';

export default function SiteTour() {
  const { run, steps, handleJoyrideCallback } = useSiteTour();

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#3b82f6',
        },
        tooltip: {
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '0.5rem',
        },
        buttonSkip: {
          color: '#6b7280',
        },
      }}
    />
  );
} 