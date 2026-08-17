import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { 
  LayoutDashboard, BarChart3, ClipboardCheck, 
  MessageSquare, AlertTriangle, Lightbulb, Brain,
  Smile, Moon, Activity, BookText, ChevronRight, Sparkles, Wind, ShieldCheck
} from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function FeaturesHub() {
  const router = useRouter();
  const { isDarkMode } = useWellness();

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';

  const sections = [
    {
      title: 'SYSTEM OVERVIEW',
      items: [
        { name: 'Home Dashboard', desc: 'Main Wellness Hub & AI Score', icon: LayoutDashboard, route: '/(tabs)', color: JUCOCH_GREEN },
        { name: 'AI Insights & Analytics', desc: 'Behavioral trends & mood charts', icon: BarChart3, route: '/(tabs)/insights', color: '#1E88E5' },
      ]
    },
    {
      title: 'AI POWERED FEATURES',
      items: [
        { name: 'Jucoch AI Companion', desc: '24/7 Anonymized Mental Health Chat', icon: Sparkles, route: '/(tabs)/chat', color: '#8E24AA' },
        { name: 'Behavioral Correlators', desc: 'AI Sleep & Exercise correlations', icon: Brain, route: '/(tabs)/insights', color: '#FF9F43' },
        { name: 'Early Warning System', desc: 'Automated distress detection', icon: AlertTriangle, route: '/(tabs)/insights', color: '#D90429' },
      ]
    },
    {
      title: 'DAILY WELLNESS TRACKING',
      items: [
        { name: 'Mood Logger', desc: 'Express your daily emotions', icon: Smile, route: '/mood-logger', color: '#48BB78' },
        { name: 'Sleep Tracker', desc: 'Monitor sleep duration & quality', icon: Moon, route: '/sleep-logger', color: '#5F27CD' },
        { name: 'Gratitude Journal', desc: 'Private encrypted reflections', icon: BookText, route: '/journal-logger', color: '#FF9F43' },
      ]
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
      >
        <View style={styles.responsiveWrapper}>
          
          {/* Header Banner */}
          <LinearGradient
            colors={['#1B4332', '#2D6A4F', '#40916C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerIconBg}>
              <Sparkles size={24} color="#FFF" />
            </View>
            <Text style={styles.headerTitle}>System Features & Tools Hub</Text>
            <Text style={styles.headerSub}>Explore all modules of the Jucoch Wellness System in one place.</Text>
          </LinearGradient>

          {/* Section Modules */}
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionLabel}>{section.title}</Text>
              
              <Surface style={[styles.gridCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <View key={item.name}>
                      {index > 0 && <Divider style={[styles.divider, { backgroundColor: dynamicBorder }]} />}
                      <TouchableOpacity 
                        style={styles.featureItem}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.iconSurface, { backgroundColor: `${item.color}18` }]}>
                          <Icon size={22} color={item.color} />
                        </View>

                        <View style={styles.featureTextContainer}>
                          <Text style={[styles.featureName, { color: dynamicText }]}>{item.name}</Text>
                          <Text style={[styles.featureDesc, { color: dynamicSub }]}>{item.desc}</Text>
                        </View>

                        <ChevronRight size={18} color={dynamicSub} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </Surface>
            </View>
          ))}

          <View style={styles.footer}>
            <ShieldCheck size={16} color={JUCOCH_GREEN} style={{ marginBottom: 4 }} />
            <Text style={[styles.versionText, { color: dynamicSub }]}>JUCOCH AI SYSTEM • BETA v1.0.0</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 140,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  headerGradient: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 320,
  },
  section: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  gridCard: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconSurface: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
