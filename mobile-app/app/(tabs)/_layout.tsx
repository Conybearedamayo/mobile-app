import React from 'react';
import { View, Platform, Dimensions, Pressable, StyleSheet } from 'react-native';
import { Home, BarChart2, Plus, MessageCircle, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function TabLayout() {
  const { userRole, isDarkMode } = useWellness();
  const insets = useSafeAreaInsets();

  // Hide non-management tabs for Admin
  const isAdmin = userRole === 'Admin';

  const tabBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const tabBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';
  const inactiveColor = isDarkMode ? '#9EB3A5' : '#888888';

  // Responsive offsets so bottom tab bar fits perfectly on cellphones and web preview
  const horizontalMargin = width < 360 ? 10 : 14;
  const bottomOffset = Platform.OS === 'ios'
    ? (insets.bottom > 0 ? insets.bottom : 14)
    : Platform.OS === 'android'
      ? (insets.bottom > 0 ? insets.bottom + 8 : 12)
      : 16;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: JUCOCH_GREEN,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: -0.2,
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomOffset,
          left: horizontalMargin,
          right: horizontalMargin,
          height: 64,
          borderRadius: 24,
          backgroundColor: tabBg,
          borderColor: tabBorder,
          borderWidth: 1.5,
          elevation: 8,
          shadowColor: JUCOCH_GREEN,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
          paddingHorizontal: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={21} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) => <BarChart2 size={21} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarItemStyle: isAdmin ? { display: 'none' } : undefined,
          tabBarButton: isAdmin ? () => null : (props) => (
            <Pressable
              onPress={props.onPress}
              onLongPress={props.onLongPress}
              accessibilityRole="button"
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              style={[
                props.style,
                styles.centerButtonContainer,
              ]}
            >
              <View style={styles.centerPlusCircle}>
                <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color }) => <MessageCircle size={21} color={color} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={21} color={color} strokeWidth={2.2} />,
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

const styles = StyleSheet.create({
  centerButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  centerPlusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: JUCOCH_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
