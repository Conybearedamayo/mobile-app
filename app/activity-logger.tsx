import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Chip, Surface } from 'react-native-paper';
import { ChevronLeft, Activity, Dumbbell, Users, Briefcase, Coffee } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const JUCOCH_GREEN = '#2D6A4F';

export default function ActivityLoggerScreen() {
  const router = useRouter();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
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
        <Activity size={20} color={JUCOCH_GREEN} />
        <Text style={styles.noteText}>
          AI Prediction: Engaging in physical activity today could improve your sleep quality by 15%.
        </Text>
      </Surface>

      <Button 
        mode="contained" 
        buttonColor={JUCOCH_GREEN} 
        style={styles.saveButton}
        onPress={() => router.back()}
      >
        Save Activities
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
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1.5, marginBottom: 20 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  activityCard: { width: '48%', backgroundColor: '#F8F9FA', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  selectedCard: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  selectedIconBox: { backgroundColor: 'rgba(255,255,255,0.2)' },
  activityName: { fontWeight: 'bold', color: '#333', fontSize: 13 },
  selectedText: { color: '#FFF' },
  aiNote: { flexDirection: 'row', backgroundColor: '#F0F5F2', padding: 16, borderRadius: 16, marginBottom: 32, alignItems: 'center' },
  noteText: { fontSize: 12, color: JUCOCH_GREEN, marginLeft: 12, flex: 1 },
  saveButton: { borderRadius: 16, paddingVertical: 6 },
});
