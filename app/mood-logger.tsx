import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button, Surface, Portal, Modal, PaperProvider } from 'react-native-paper';
import { ChevronLeft, Info, MessageCircle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

const MOODS = [
  { label: 'Awful', emoji: '😫', color: '#FF6B6B', prompt: 'I am sorry you are feeling this way. Nganong sad man ka?' },
  { label: 'Bad', emoji: '☹️', color: '#FF9F43', prompt: 'I noticed you are feeling down. Nganong sad man ka?' },
  { label: 'Good', emoji: '🙂', color: '#FBC531', prompt: 'Glad to hear that! What made your day good?' },
  { label: 'Great', emoji: '😊', color: '#4BCFFA', prompt: 'That is awesome! Share the joy?' },
  { label: 'Amazing', emoji: '🤩', color: '#48BB78', prompt: 'Fantastic! You are doing great today!' },
];

export default function MoodLoggerScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleMoodSelect = (mood: any) => {
    setSelectedMood(mood);
    if (mood.label === 'Awful' || mood.label === 'Bad') {
      setShowModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.title}>Mood Logger</Text>
        </View>

        <Surface style={styles.infoCard} elevation={1}>
          <Info size={18} color={JUCOCH_GREEN} />
          <Text style={styles.infoText}>Tracking your mood helps Jucoch AI understand your emotional patterns.</Text>
        </Surface>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW ARE YOU FEELING RIGHT NOW?</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => {
              const isSelected = selectedMood?.label === m.label;
              return (
                <TouchableOpacity 
                  key={m.label} 
                  style={[styles.moodCard, isSelected && { borderColor: m.color, backgroundColor: m.color + '15' }]}
                  onPress={() => handleMoodSelect(m)}
                >
                  <Text style={[styles.emoji, !isSelected && { opacity: 0.6 }]}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, isSelected && { color: m.color, fontWeight: 'bold' }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button 
          mode="contained" 
          buttonColor={JUCOCH_GREEN} 
          style={styles.saveButton}
          contentStyle={{ height: 56 }}
          onPress={() => router.back()}
          disabled={!selectedMood}
        >
          Save Mood Entry
        </Button>
      </ScrollView>

      {/* Modern Feedback Modal */}
      <Portal>
        <Modal 
          visible={showModal} 
          onDismiss={() => setShowModal(false)} 
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowModal(false)}>
                <X size={20} color="#999" />
            </TouchableOpacity>
            
            <Text style={styles.modalEmoji}>{selectedMood?.emoji}</Text>
            <Text variant="headlineSmall" style={styles.modalTitle}>Nganong sad man ka?</Text>
            <Text style={styles.modalDesc}>
                {selectedMood?.prompt} Do you want to communicate with Jucoch AI now?
            </Text>

            <View style={styles.modalButtons}>
                <Button 
                    mode="outlined" 
                    onPress={() => setShowModal(false)} 
                    style={styles.modalBtn}
                    textColor="#666"
                >
                    Maybe later
                </Button>
                <Button 
                    mode="contained" 
                    buttonColor={JUCOCH_GREEN} 
                    onPress={() => {
                        setShowModal(false);
                        router.push('/(tabs)/chat');
                    }}
                    style={[styles.modalBtn, styles.primaryModalBtn]}
                >
                    Talk to AI
                </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backButton: { marginRight: 16, backgroundColor: '#FFF', padding: 8, borderRadius: 12 },
  title: { fontWeight: 'bold', color: '#1A1A1A' },
  infoCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 32, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  infoText: { fontSize: 12, color: '#666', marginLeft: 12, flex: 1, lineHeight: 18 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#999', letterSpacing: 1.5, marginBottom: 20 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moodCard: { width: '31%', paddingVertical: 24, borderRadius: 24, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#FFF', backgroundColor: '#FFF' },
  emoji: { fontSize: 44, marginBottom: 8 },
  moodLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  saveButton: { borderRadius: 18, elevation: 4, shadowColor: JUCOCH_GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, marginTop: 20 },
  
  // Modal Styles
  modalContainer: { padding: 20, justifyContent: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 32, padding: 32, alignItems: 'center' },
  closeIcon: { position: 'absolute', top: 20, right: 20 },
  modalEmoji: { fontSize: 64, marginBottom: 16 },
  modalTitle: { fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center' },
  modalDesc: { textAlign: 'center', color: '#666', marginTop: 12, lineHeight: 22, fontSize: 14 },
  modalButtons: { flexDirection: 'row', marginTop: 32, justifyContent: 'space-between', width: '100%' },
  modalBtn: { flex: 1, borderRadius: 14, marginHorizontal: 4 },
  primaryModalBtn: { elevation: 2 },
});
