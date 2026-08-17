import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Fallback IP for physical mobile devices when hostUri is unavailable
const FALLBACK_IP = '192.168.100.32';

/**
 * Mobile Host IP Resolver
 * Automatically retrieves the developer's laptop IP address via Expo Go hostUri
 * so mobile devices (Android / iOS) seamlessly communicate with the backend API.
 */
const getMobileHostIp = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return FALLBACK_IP;
};

// Pure Mobile API Base URL
export const API_BASE_URL = `http://${getMobileHostIp()}:3000`;




