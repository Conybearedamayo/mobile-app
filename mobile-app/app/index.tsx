import React from 'react';
import { Redirect } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';

/**
 * Entry Root Guard
 * Automatically redirects unauthenticated users to /login screen
 * and authenticated users to /(tabs) dashboard.
 */
export default function Index() {
  const { userToken } = useWellness();

  if (!userToken) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
