import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ChevronLeft, Activity, Dumbbell, Users, Briefcase, Coffee } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const JUCOCH_GREEN = '#2D6A4F';

export default function ActivityLoggerScreen() {
  const router = useRouter();
  const { addActivityEntry } = useWellness();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const handleSave = () => {
    if (selectedActivities.length === 0) {
      router.back();
      return;
    }
    selectedActivities.forEach(activity => {
      addActivityEntry(activity, 30); // Default duration 30 mins
    });
    router.back();
  };

  const activities = [
    { name: 'Exercise', icon: Dumbbell },
    { name: 'Socializing', icon: Users },
    { name: 'Work/Study', icon: Briefcase },
    { name: 'Relaxing', icon: Coffee },
    { name: 'Hobbies', icon: Activity },
  ];

  const toggleActivity = (name: string) => {
    if (selectedActivities.includes(name)) {
      setSelectedActivities(selectedActivities.filter(a => a !== name));
    } else {
      setSelectedActivities([...selectedActivities, name]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1C1F1D" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.title}>Activity Log</Text>
        </View>

        <Text style={styles.sectionLabel}>WHAT HAVE YOU BEEN UP TO?</Text>
        
        <View style={styles.activityGrid}>
          {activities.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedActivities.includes(item.name);
            return (
              <TouchableOpacity 
                key={item.name} 
                style={[styles.activityCard, isSelected && styles.selectedCard]}
                onPress={() => toggleActivity(item.name)}
                activeOpacity={0.8}
              >
                <Surface style={[styles.iconBox, isSelected && styles.selectedIconBox]} elevation={0}>
                  <Icon size={24} color={isSelected ? '#FFF' : JUCOCH_GREEN} />
                </Surface>
                <Text style={[styles.activityName, isSelected && styles.selectedText]}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Surface style={styles.aiNote} elevation={1}>
          <View style={styles.insightIconBg}>
            <Activity size={18} color={JUCOCH_GREEN} />
          </View>
          <Text style={styles.noteText}>
            AI Prediction: Engaging in physical activity today could improve your sleep quality by 15%.
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
            <Text style={styles.gradientButtonText}>Save Activities</Text>
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
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#909591', letterSpacing: 1.5, marginBottom: 20 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  activityCard: { 
    width: '48%', 
    backgroundColor: '#FFF', 
    borderRadius: 22, 
    padding: 20, 
    alignItems: 'center', 
    marginBottom: 16, 
    borderWidth: 1.5, 
    borderColor: '#EBF2EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  selectedCard: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  iconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: '#E8F5E9', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  selectedIconBox: { backgroundColor: 'rgba(255,255,255,0.22)' },
  activityName: { fontWeight: 'bold', color: '#333A36', fontSize: 13 },
  selectedText: { color: '#FFF' },
  aiNote: { 
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
  noteText: { fontSize: 12, color: JUCOCH_GREEN, flex: 1, fontWeight: '500', lineHeight: 18 },
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
