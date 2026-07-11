import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { 
  LayoutDashboard, BarChart3, ClipboardCheck, 
  MessageSquare, AlertTriangle, Lightbulb, Brain,
  Smile, Moon, Activity, BookText, ChevronRight
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function FeaturesHub() {
  const router = useRouter();

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, route: '/(tabs)' },
        { name: 'Analytics', icon: BarChart3, route: '/(tabs)/insights' },
        { name: 'Check-ins', icon: ClipboardCheck, route: '/(tabs)/insights' },
      ]
    },
    {
      title: 'AI FEATURES',
      items: [
        { name: 'Ai-Companion', icon: MessageSquare, route: '/(tabs)/chat' },
        { name: 'Early Warnings', icon: AlertTriangle, route: '/(tabs)/insights' },
        { name: 'Recommendations', icon: Lightbulb, route: '/(tabs)/insights' },
        { name: 'Behavioral Analysis', icon: Brain, route: '/(tabs)/insights' },
      ]
    },
    {
      title: 'TRACKING',
      items: [
        { name: 'Mood Logger', icon: Smile, route: '/mood-logger' },
        { name: 'Sleep Patterns', icon: Moon, route: '/sleep-logger' },
        { name: 'Activity Log', icon: Activity, route: '/activity-logger' },
        { name: 'Journal', icon: BookText, route: '/journal' },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>System Control</Text>
        <Text variant="bodySmall" style={styles.subtitle}>Access all JUCOCH features in one place</Text>
      </View>

      {sections.map((section, sIdx) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.title}</Text>
          <View style={styles.grid}>
            {section.items.map((item, iIdx) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity 
                  key={item.name} 
                  style={styles.featureItem}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <Surface style={styles.iconSurface} elevation={1}>
                    <Icon size={24} color={JUCOCH_GREEN} />
                  </Surface>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureName}>{item.name}</Text>
                    <ChevronRight size={16} color="#CCC" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
          <Text style={styles.versionText}>JUCOCH AI System v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  grid: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
  },
  iconSurface: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
      marginTop: 20,
      alignItems: 'center',
      paddingBottom: 40,
  },
  versionText: {
      color: '#CCC',
      fontSize: 11,
      fontWeight: 'bold',
  }
});
