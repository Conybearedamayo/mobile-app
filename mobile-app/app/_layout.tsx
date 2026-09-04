import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/components/useColorScheme';
import { WellnessProvider } from '@/context/WellnessContext';
import { lightTheme, darkTheme } from '@/src/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
    ...(Platform.OS !== 'ios' ? { NotoColorEmoji: require('../assets/fonts/NotoColorEmoji.ttf') } : {}),
  });

  // Log any non-critical font loading errors instead of crashing the app
  useEffect(() => {
    if (error) {
      console.warn('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <WellnessProvider>
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="mood-logger" options={{ headerShown: false }} />
          <Stack.Screen name="sleep-logger" options={{ headerShown: false }} />
          <Stack.Screen name="activity-logger" options={{ headerShown: false }} />
          <Stack.Screen name="journal-logger" options={{ headerShown: false }} />
          <Stack.Screen name="journal" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </WellnessProvider>
    </PaperProvider>
  );
}