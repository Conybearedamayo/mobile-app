import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ChevronLeft, Moon, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const JUCOCH_GREEN = '#2D6A4F';

export default function SleepLoggerScreen() {
  const router = useRouter();
  const { addSleepLog } = useWellness();
  const [hours, setHours] = useState('7');
  const [quality, setQuality] = useState('Good');

  const handleSave = () => {
    const numericHours = parseInt(hours.replace('+', ''), 10) || 7;
    addSleepLog(numericHours, quality);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1C1F1D" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.title}>Sleep Patterns</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW MANY HOURS DID YOU SLEEP?</Text>
          <View style={styles.hoursRow}>
            {['4', '5', '6', '7', '8', '9+'].map(h => {
              const isSelected = hours === h;
              return (
                <TouchableOpacity 
                  key={h} 
                  style={[styles.hourCircle, isSelected && styles.selectedCircle]}
                  onPress={() => setHours(h)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.hourText, isSelected && styles.selectedText]}>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SLEEP QUALITY</Text>
          {['Poor', 'Alright', 'Good', 'Excellent'].map(q => {
            const isSelected = quality === q;
            return (
              <TouchableOpacity 
                key={q} 
                style={[styles.qualityRow, isSelected && styles.selectedQuality]}
                onPress={() => setQuality(q)}
                activeOpacity={0.8}
              >
                <Text style={[styles.qualityText, isSelected && styles.selectedText]}>{q}</Text>
                {isSelected && <Star size={18} color="#FFF" fill="#FFF" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Surface style={styles.aiInsight} elevation={1}>
          <View style={styles.insightIconBg}>
            <Moon size={18} color={JUCOCH_GREEN} />
          </View>
          <Text style={styles.insightText}>
            AI Note: Consistent 7-8 hours of sleep is linked to a 40% improvement in mood stability.
          </Text>
        </Surface>

        <TouchableOpacity 
          onPress={handleSave}
          activeOpacity={0.8}
          style={styles.saveButtonWrapper}
        >
          <LinearGradient
            colors={[JUCOCH_GREEN, '#1B4332']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.gradientButtonText}>Save Sleep Log</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F8F5' },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 36 },
  backButton: { 
    marginRight: 16, 
    backgroundColor: '#FFF', 
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBF2EE',
  },
  title: { fontWeight: 'bold', color: '#1C1F1D' },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#909591', letterSpacing: 1.5, marginBottom: 16 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hourCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#EBF2EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  selectedCircle: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  hourText: { fontWeight: 'bold', color: '#707571', fontSize: 15 },
  selectedText: { color: '#FFF' },
  qualityRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: '#FFF', 
    marginBottom: 12, 
    borderWidth: 1.5, 
    borderColor: '#EBF2EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  selectedQuality: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  qualityText: { fontWeight: '600', color: '#707571', fontSize: 15 },
  aiInsight: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 22, 
    marginBottom: 28, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF2EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  insightIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightText: { fontSize: 12, color: JUCOCH_GREEN, flex: 1, fontWeight: '500', lineHeight: 18 },
  saveButtonWrapper: { marginTop: 12 },
  gradientButton: {
    height: 56,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  gradientButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
