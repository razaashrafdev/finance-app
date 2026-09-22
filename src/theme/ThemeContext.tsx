import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from './colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: Colors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
