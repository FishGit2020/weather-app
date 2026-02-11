import React from 'react';
import { CitiesProvider } from '@/context/CitiesContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AppRoutes from '@/routes';

export default function App() {
  return (
    <ErrorBoundary>
      <CitiesProvider>
        <AppRoutes />
      </CitiesProvider>
    </ErrorBoundary>
  );
}
