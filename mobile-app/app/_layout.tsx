import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
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

  const appContent = (
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

  if (Platform.OS === 'web') {
    return (
      <View style={webStyles.outerWrapper}>
        <View style={webStyles.phoneContainer}>
          {appContent}
        </View>
      </View>
    );
  }

  return appContent;
}

const webStyles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: '100vh' as any,
    backgroundColor: '#0F172A', // Sleek neutral slate dark canvas so the mobile app stands out
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    height: '100%',
    minHeight: '100vh' as any,
    backgroundColor: '#F3F8F5',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
      } as any,
    }),
  },
});