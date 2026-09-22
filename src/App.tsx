import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import { AppStoreProvider } from './store/AppStore';
import AppSplash from './components/common/AppSplash';
import AppSafeFrame from './components/common/AppSafeFrame';
import MainNavigator from './navigation/MainNavigator';

try {
  SplashScreen.preventAutoHideAsync();
  SplashScreen.setOptions({ duration: 400, fade: true });
} catch {
  // Native splash APIs are unavailable in some Expo Go / web sessions.
}

function AppContent() {
  const { isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <AppSplash />;
  }

  return (
    <AppSafeFrame>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <MainNavigator />
    </AppSafeFrame>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppStoreProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AppStoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
