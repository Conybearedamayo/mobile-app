import React from 'react';
import { View, Platform } from 'react-native';
import { Home, BarChart2, PlusCircle, MessageCircle, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { useWellness } from '@/context/WellnessContext';

const JUCOCH_GREEN = '#2D6A4F';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userRole } = useWellness();

  // Hide non-management tabs for Admin and Teacher
  const isAdminOrTeacher = userRole === 'Admin' || userRole === 'Teacher';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: JUCOCH_GREEN,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 6,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          height: 68,
          borderRadius: 24,
          backgroundColor: '#FFF',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 12 : 8,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          href: isAdminOrTeacher ? null : undefined,
          tabBarIcon: ({ color }) => <BarChart2 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          href: isAdminOrTeacher ? null : undefined,
          tabBarIcon: () => (
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: JUCOCH_GREEN,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -28,
              elevation: 6,
              shadowColor: JUCOCH_GREEN,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}>
              <PlusCircle size={26} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          href: isAdminOrTeacher ? null : undefined,
          tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
      {/* Hide default two.tsx */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
