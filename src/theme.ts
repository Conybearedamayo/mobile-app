import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const primaryColor = '#2D6A4F'; // JUCOCH_GREEN

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: primaryColor,
    onPrimary: '#FFFFFF',
    primaryContainer: '#D0E8D8',
    onPrimaryContainer: '#1A3B2A',
    background: '#F3F8F5',
    onBackground: '#1C1F1D',
    surface: '#FFFFFF',
    onSurface: '#1C1F1D',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primaryColor,
    onPrimary: '#FFFFFF',
    primaryContainer: '#4A7C59',
    onPrimaryContainer: '#E6F4EA',
    background: '#121212',
    onBackground: '#E0E0E0',
    surface: '#1E1E1E',
    onSurface: '#E0E0E0',
  },
};

// Optional: configure fonts if needed
export const fontConfig = {
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '200',
    },
  },
};