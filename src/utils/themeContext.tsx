import { createContext, useContext, useState, ReactNode } from 'react';

export const lightColors = {
  primary: '#0b5d35',
  primaryDark: '#063b24',
  secondary: '#118047',
  accent: '#ffd21a',
  accentSoft: '#fff6bd',
  white: '#FFFFFF',
  background: '#fafafa',
  card: '#f5f5f0',
  textDark: '#1a1a1a',
  textLight: '#6b6b6b',
  border: '#e8e8e3',
  success: '#22C55E',
  error: '#EF4444',
};

export const darkColors = {
  primary: '#1a8f5a',
  primaryDark: '#0b5d35',
  secondary: '#22b366',
  accent: '#ffd21a',
  accentSoft: '#3a3a28',
  white: '#1e1e1e',
  background: '#121212',
  card: '#1e1e1e',
  textDark: '#f0f0f0',
  textLight: '#a0a0a0',
  border: '#2e2e2e',
  success: '#22C55E',
  error: '#EF4444',
};

type ThemeContextType = {
  isDark: boolean;
  colors: typeof lightColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}