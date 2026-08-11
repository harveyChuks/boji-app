import { createContext, useContext, useState, useEffect } from 'react';

export type Location = 'NG' | 'UK';

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => void;
  currency: string;
  currencySymbol: string;
  monthlyPrice: number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocationState] = useState<Location>(() => {
    if (typeof window === "undefined") return 'NG';
    const savedLocation = localStorage.getItem('location') as Location;
    return savedLocation || 'NG';
  });
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  useEffect(() => {
    // Auto-detect location on first visit
    const savedLocation = localStorage.getItem('location');
    if (!savedLocation && !isAutoDetected) {
      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          const countryCode = data.country_code;
          // Set to UK if user is in UK, otherwise default to Nigeria
          const detectedLocation: Location = countryCode === 'GB' ? 'UK' : 'NG';
          setLocationState(detectedLocation);
          setIsAutoDetected(true);
          console.log('Auto-detected location:', detectedLocation, 'from country:', countryCode);
        })
        .catch(error => {
          console.error('Failed to detect location:', error);
          setIsAutoDetected(true);
        });
    }
  }, [isAutoDetected]);

  useEffect(() => {
    localStorage.setItem('location', location);
  }, [location]);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
  };

  const currency = location === 'UK' ? 'GBP' : 'NGN';
  const currencySymbol = location === 'UK' ? '£' : '₦';
  const monthlyPrice = location === 'UK' ? 15 : 1500;

  return (
    <LocationContext.Provider value={{ location, setLocation, currency, currencySymbol, monthlyPrice }}>
      {children}
    </LocationContext.Provider>
  );
};
