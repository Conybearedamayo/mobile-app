import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { ChevronLeft, Moon, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const JUCOCH_GREEN = '#2D6A4F';

export default function SleepLoggerScreen() {
  const router = useRouter();
  const [hours, setHours] = useState('7');
  const [quality, setQuality] = useState('Good');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.title}>Sleep Patterns</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HOW MANY HOURS DID YOU SLEEP?</Text>
        <View style={styles.hoursRow}>
          {['4', '5', '6', '7', '8', '9+'].map(h => (
            <TouchableOpacity 
                key={h} 
                style={[styles.hourCircle, hours === h && styles.selectedCircle]}
                onPress={() => setHours(h)}
            >
              <Text style={[styles.hourText, hours === h && styles.selectedText]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SLEEP QUALITY</Text>
        {['Poor', 'Alright', 'Good', 'Excellent'].map(q => (
          <TouchableOpacity 
            key={q} 
            style={[styles.qualityRow, quality === q && styles.selectedQuality]}
            onPress={() => setQuality(q)}
          >
            <Text style={[styles.qualityText, quality === q && styles.selectedText]}>{q}</Text>
            {quality === q && <Star size={18} color="#FFF" fill="#FFF" />}
          </TouchableOpacity>
        ))}
      </View>

      <Surface style={styles.aiInsight} elevation={1}>
          <Moon size={20} color={JUCOCH_GREEN} />
          <Text style={styles.insightText}>
            AI Note: Consistent 7-8 hours of sleep is linked to a 40% improvement in mood stability.
          </Text>
      </Surface>

      <Button 
        mode="contained" 
        buttonColor={JUCOCH_GREEN} 
        style={styles.saveButton}
        onPress={() => router.back()}
      >
        Save Sleep Log
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  backButton: { marginRight: 16, backgroundColor: '#F5F5F5', padding: 8, borderRadius: 12 },
  title: { fontWeight: 'bold', color: '#1A1A1A' },
  section: { marginBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1.5, marginBottom: 20 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hourCircle: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  selectedCircle: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  hourText: { fontWeight: 'bold', color: '#666' },
  selectedText: { color: '#FFF' },
  qualityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#F8F9FA', marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  selectedQuality: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  qualityText: { fontWeight: '600', color: '#666' },
  aiInsight: { flexDirection: 'row', backgroundColor: '#F0F5F2', padding: 16, borderRadius: 16, marginBottom: 32, alignItems: 'center' },
  insightText: { fontSize: 12, color: JUCOCH_GREEN, marginLeft: 12, flex: 1 },
  saveButton: { borderRadius: 16, paddingVertical: 6 },
});
