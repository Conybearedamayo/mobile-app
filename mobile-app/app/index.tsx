import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';

/**
 * Entry Root Guard
 * Automatically redirects unauthenticated users to /login screen
 * and authenticated users to /(tabs) dashboard, with session persistence.
 */
export default function Index() {
  const { userToken, isAuthLoading } = useWellness();

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  if (!userToken) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F8F5',
  },
});
