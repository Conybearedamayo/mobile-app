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

// Set this to your live Render/Railway URL once deployed (e.g. 'https://jucoch-backend.onrender.com')
// If empty (''), it will automatically use your local developer IP for testing.
const PRODUCTION_BACKEND_URL = '';

// Pure Mobile API Base URL Resolver
export const API_BASE_URL = PRODUCTION_BACKEND_URL || `http://${getMobileHostIp()}:3000`;




