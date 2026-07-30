import { Platform } from 'react-native';

// Default to localhost for web/iOS, 10.0.2.2 for Android emulator
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();
