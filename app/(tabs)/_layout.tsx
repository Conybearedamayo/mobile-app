import React from 'react';
import { View, Platform, Dimensions } from 'react-native';
import { Home, BarChart2, PlusCircle, MessageCircle, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function TabLayout() {
  const { userRole, isDarkMode } = useWellness();

  // Hide non-management tabs for Admin
  const isAdmin = userRole === 'Admin';

  const tabBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const tabBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';
  const inactiveColor = isDarkMode ? '#9EB3A5' : '#888888';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: JUCOCH_GREEN,
        tabBarInactiveTintColor: inactiveColor,
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
          left: width > 600 ? '25%' : 16,
          right: width > 600 ? '25%' : 16,
          maxWidth: 600,
          height: 68,
          borderRadius: 26,
          backgroundColor: tabBg,
          borderColor: tabBorder,
          borderWidth: 1.5,
          elevation: 8,
          shadowColor: JUCOCH_GREEN,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
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
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) => <BarChart2 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          href: isAdmin ? null : undefined,
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
          href: isAdmin ? null : undefined,
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
