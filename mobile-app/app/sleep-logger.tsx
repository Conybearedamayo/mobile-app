import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ChevronLeft, Moon, Star } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const JUCOCH_GREEN = '#2D6A4F';

export default function SleepLoggerScreen() {
  const router = useRouter();
  const { addSleepLog, isDarkMode } = useWellness();
  const [hours, setHours] = useState('7');
  const [quality, setQuality] = useState('Good');

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';

  const handleSave = () => {
    const numericHours = parseInt(hours.replace('+', ''), 10) || 7;
    addSleepLog(numericHours, quality);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}>
            <ChevronLeft size={24} color={dynamicText} />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={[styles.title, { color: dynamicText }]}>Sleep Patterns</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: dynamicSub }]}>HOW MANY HOURS DID YOU SLEEP?</Text>
          <View style={styles.hoursRow}>
            {['4', '5', '6', '7', '8', '9+'].map(h => {
              const isSelected = hours === h;
              return (
                <TouchableOpacity 
                  key={h} 
                  style={[
                    styles.hourCard, 
                    { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                    isSelected && styles.selectedHourCard
                  ]}
                  onPress={() => setHours(h)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.hourText, { color: dynamicText }, isSelected && styles.selectedHourText]}>{h}</Text>
                  <Text style={[styles.hourUnit, { color: dynamicSub }, isSelected && styles.selectedHourText]}>hrs</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: dynamicSub }]}>SLEEP QUALITY</Text>
          <View style={styles.qualityGrid}>
            {[
              { label: 'Restless', icon: '😫', color: '#FF6B6B' },
              { label: 'Poor', icon: '🙁', color: '#FF9F43' },
              { label: 'Good', icon: '🙂', color: '#FBC531' },
              { label: 'Excellent', icon: '😴', color: '#48BB78' }
            ].map(q => {
              const isSelected = quality === q.label;
              return (
                <TouchableOpacity
                  key={q.label}
                  style={[
                    styles.qualityCard,
                    { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                    isSelected && { borderColor: q.color, borderWidth: 2, backgroundColor: `${q.color}18` }
                  ]}
                  onPress={() => setQuality(q.label)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qualityEmoji}>{q.icon}</Text>
                  <Text style={[styles.qualityLabel, { color: dynamicSub }, isSelected && { color: q.color, fontWeight: 'bold' }]}>{q.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveBtnWrapper}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[JUCOCH_GREEN, '#1B4332']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <Text style={styles.saveBtnText}>Save Sleep Record</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: { marginRight: 16, width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  title: { fontWeight: 'bold' },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 16 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hourCard: { width: '15%', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1.5 },
  selectedHourCard: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  hourText: { fontSize: 16, fontWeight: 'bold' },
  hourUnit: { fontSize: 10, marginTop: 2 },
  selectedHourText: { color: '#FFF' },
  qualityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  qualityCard: { width: '48%', paddingVertical: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1.5 },
  qualityEmoji: { fontSize: 32, marginBottom: 6 },
  qualityLabel: { fontSize: 13, fontWeight: '600' },
  saveBtnWrapper: { marginTop: 12 },
  saveBtnGradient: { height: 56, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
