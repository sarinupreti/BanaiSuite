import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Currency = 'USD' | 'NPR' | 'INR';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem('currency') as Currency) || 'USD');

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = () => {
        const isDark =
          theme === 'dark' ||
          (theme === 'system' && mediaQuery.matches);
        root.classList.toggle('dark', isDark);
    }
    
    handleThemeChange();
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);

  }, [theme]);
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const setCurrency = (newCurrency: Currency) => {
    localStorage.setItem('currency', newCurrency);
    setCurrencyState(newCurrency);
  }

  const value = { theme, setTheme, currency, setCurrency };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
