import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, Text, useWindowDimensions } from 'react-native';
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

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
    const isDesktopWeb = windowWidth > 500;

    if (isDesktopWeb) {
      // Calculate responsive phone frame dimensions for desktop web
      const phoneWidth = Math.min(windowWidth - 32, 414);
      const phoneHeight = Math.min(windowHeight - 80, 850);

      return (
        <View style={webStyles.outerWrapper}>
          {/* Subtle Desktop Header Indicator */}
          <View style={webStyles.desktopHeader}>
            <View style={webStyles.brandDot} />
            <Text style={webStyles.desktopHeaderText}>JUCOCH MENTAL HEALTH • LIVE MOBILE APP PREVIEW</Text>
          </View>

          {/* Smartphone Hardware Frame */}
          <View style={[webStyles.phoneFrame, { width: phoneWidth, height: phoneHeight }]}>
            {/* Top Dynamic Island / Speaker Notch */}
            <View style={webStyles.dynamicIsland}>
              <View style={webStyles.speakerEar} />
              <View style={webStyles.cameraLens} />
            </View>

            {/* Mobile Screen Area */}
            <View style={webStyles.screenArea}>
              {appContent}
            </View>

            {/* Bottom Home Indicator Bar */}
            <View style={webStyles.homeIndicatorBar} />
          </View>
        </View>
      );
    }

    // On actual mobile device or narrow viewport on web, fit 100% of the screen seamlessly
    return (
      <View style={webStyles.mobileWrapper}>
        {appContent}
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
    backgroundColor: '#0B1120', // Modern sleek slate backdrop
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  desktopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48BB78',
    marginRight: 8,
  },
  desktopHeaderText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  phoneFrame: {
    borderRadius: 48,
    borderWidth: 9,
    borderColor: '#1E293B',
    backgroundColor: '#F3F8F5',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.12)',
      } as any,
    }),
  },
  dynamicIsland: {
    position: 'absolute',
    top: 9,
    alignSelf: 'center',
    width: 104,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    pointerEvents: 'none' as any,
  },
  speakerEar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E293B',
  },
  cameraLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  screenArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  homeIndicatorBar: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 9999,
    pointerEvents: 'none' as any,
  },
  mobileWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: (Platform.OS === 'web' ? '100dvh' : '100%') as any,
    backgroundColor: '#F3F8F5',
  },
});