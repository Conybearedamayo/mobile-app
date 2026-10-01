import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Platform, Modal as NativeModal } from 'react-native';
import { Text, Portal, Modal, Surface } from 'react-native-paper';
import { ChevronLeft, Info, X, Trash2, Edit3, Clock, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { useWellness, MoodEntry } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

const MOODS = [
  { label: 'Awful', emoji: '😫', color: '#FF6B6B', prompt: 'I am sorry you are feeling this way. What brought on this feeling?' },
  { label: 'Bad', emoji: '☹️', color: '#FF9F43', prompt: 'I noticed you are feeling down. What is on your mind?' },
  { label: 'Good', emoji: '🙂', color: '#FBC531', prompt: 'Glad to hear that! What made your day good?' },
  { label: 'Great', emoji: '😊', color: '#4BCFFA', prompt: 'That is awesome! Share your positive moment?' },
  { label: 'Amazing', emoji: '🤩', color: '#48BB78', prompt: 'Fantastic! You are doing great today!' },
];

function ConfettiPiece({ delay }: { delay: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000 + Math.random() * 1500,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, delay]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, height],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['45deg', `${45 + Math.random() * 360}deg`],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  const randomLeft = useRef(`${Math.random() * 100}%`).current;
  const randomColor = useRef(
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607', '#8338EC'][Math.floor(Math.random() * 6)]
  ).current;

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: randomLeft as any,
          backgroundColor: randomColor,
          transform: [{ translateY }, { rotate }],
          opacity,
        },
      ]}
    />
  );
}

export default function MoodLoggerScreen() {
  const router = useRouter();
  const { addMoodLog, editMoodLog, deleteMoodLog, moodLogs, setWellnessScore, isDarkMode } = useWellness();

  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Mood State
  const [editingMood, setEditingMood] = useState<MoodEntry | null>(null);
  const [editMoodChoice, setEditMoodChoice] = useState<string>('Good');

  // Delete Mood State
  const [deletingMoodId, setDeletingMoodId] = useState<string | number | null>(null);

  const formatEventDate = (timestamp?: string) => {
    if (!timestamp) return 'Today';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return timestamp;
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${weekday}, ${month} ${day} • ${time}`;
    } catch (e) {
      return 'Today';
    }
  };

  const handleStartEdit = (entry: MoodEntry) => {
    setEditingMood(entry);
    setEditMoodChoice(entry.mood);
  };

  const handleSaveEdit = () => {
    if (!editingMood) return;
    const moodObj = MOODS.find(m => m.label === editMoodChoice) || MOODS[2];
    editMoodLog(editingMood.id, moodObj.label, moodObj.emoji, editingMood.note);
    setEditingMood(null);
    setSuccessMsg('Mood entry updated successfully!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleConfirmDelete = () => {
    if (!deletingMoodId) return;
    deleteMoodLog(deletingMoodId);
    setDeletingMoodId(null);
    setSuccessMsg('Mood entry deleted successfully.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';

  const isPositiveMood = (label?: string) => {
    return label === 'Good' || label === 'Great' || label === 'Amazing';
  };

  const handleMoodSelect = (mood: any) => {
    setSelectedMood(mood);

    if (isPositiveMood(mood.label)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } else {
      setShowConfetti(false);
    }

    if (mood.label === 'Awful' || mood.label === 'Bad') {
      setShowModal(true);
    }
  };

  const handleSave = () => {
    if (!selectedMood) return;

    addMoodLog({
      id: Date.now(),
      mood: selectedMood.label,
      emoji: selectedMood.emoji,
      timestamp: new Date().toISOString()
    });

    const moodScores: { [key: string]: number } = {
      'Awful': 20,
      'Bad': 40,
      'Good': 60,
      'Great': 80,
      'Amazing': 100
    };

    const newScore = moodScores[selectedMood.label] || 50;
    setWellnessScore(newScore);

    if (isPositiveMood(selectedMood.label)) {
      setShowConfetti(true);
      setTimeout(() => {
        router.back();
      }, 1200);
    } else {
      setShowConfetti(false);
      setTimeout(() => {
        router.back();
      }, 400);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}>
            <ChevronLeft size={24} color={dynamicText} />
          </TouchableOpacity>
          <View>
            <Text variant="headlineSmall" style={[styles.title, { color: dynamicText }]}>Mood Logger</Text>
          </View>
        </View>

        <Surface style={[styles.infoCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
          <View style={styles.infoIconBg}>
            <Info size={16} color={JUCOCH_GREEN} />
          </View>
          <Text style={[styles.infoText, { color: dynamicSub }]}>Tracking your mood helps Jucoch AI understand your emotional patterns.</Text>
        </Surface>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: dynamicSub }]}>HOW ARE YOU FEELING RIGHT NOW?</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => {
              const isSelected = selectedMood?.label === m.label;
              return (
                <TouchableOpacity
                  key={m.label}
                  style={[
                    styles.moodCard, 
                    { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                    isSelected && { borderColor: m.color, borderWidth: 2, backgroundColor: `${m.color}20` }
                  ]}
                  onPress={() => handleMoodSelect(m)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.emoji, !isSelected && { opacity: 0.7 }]}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: dynamicSub }, isSelected && { color: m.color, fontWeight: 'bold' }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!selectedMood}
          activeOpacity={0.8}
          style={[styles.saveButtonWrapper, !selectedMood && styles.disabledBtn]}
        >
          <LinearGradient
            colors={selectedMood ? [JUCOCH_GREEN, '#1B4332'] : [isDarkMode ? '#28332C' : '#CCC', isDarkMode ? '#28332C' : '#BBB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.gradientButtonText}>Save Mood Entry</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Success Banner */}
        {!!successMsg && (
          <Surface style={styles.successCard} elevation={2}>
            <CheckCircle size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
            <Text style={styles.successText}>{successMsg}</Text>
          </Surface>
        )}

        {/* Recently Logged Moods */}
        {moodLogs && moodLogs.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <View style={styles.sectionHeaderRow}>
              <Clock size={14} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={[styles.sectionLabel, { color: dynamicSub }]}>RECENT MOOD CHECK-INS ({moodLogs.length})</Text>
            </View>

            {moodLogs.slice(0, 5).map((entry) => (
              <Surface key={entry.id} style={[styles.recentMoodItem, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <Text style={styles.recentEmoji}>{entry.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.recentMoodTitle, { color: dynamicText }]}>{entry.mood}</Text>
                  <Text style={[styles.recentMoodDate, { color: dynamicSub }]}>{formatEventDate(entry.timestamp)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity 
                    onPress={() => handleStartEdit(entry)}
                    style={{ padding: 6, borderRadius: 8, backgroundColor: isDarkMode ? '#28332C' : '#F0F7F2' }}
                  >
                    <Edit3 size={15} color={JUCOCH_GREEN} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setDeletingMoodId(entry.id)}
                    style={{ padding: 6, borderRadius: 8, backgroundColor: isDarkMode ? '#331F21' : '#FFE5E5' }}
                  >
                    <Trash2 size={15} color="#D90429" />
                  </TouchableOpacity>
                </View>
              </Surface>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Edit Mood Modal */}
      <NativeModal
        visible={!!editingMood}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingMood(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.editModalCard, { backgroundColor: dynamicCardBg }]} elevation={4}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Edit3 size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: dynamicText }}>Edit Mood Entry</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingMood(null)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: dynamicSub, marginBottom: 14 }]}>SELECT UPDATED MOOD</Text>
            <View style={[styles.moodGrid, { marginBottom: 16 }]}>
              {MOODS.map((m) => {
                const isSelected = editMoodChoice === m.label;
                return (
                  <TouchableOpacity
                    key={m.label}
                    style={[
                      styles.moodCard,
                      { backgroundColor: dynamicCardBg, borderColor: dynamicBorder, paddingVertical: 12 },
                      isSelected && { borderColor: m.color, borderWidth: 2, backgroundColor: `${m.color}20` }
                    ]}
                    onPress={() => setEditMoodChoice(m.label)}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 2 }}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: dynamicSub }, isSelected && { color: m.color, fontWeight: 'bold' }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: dynamicBorder }]} onPress={() => setEditingMood(null)}>
                <Text style={{ color: dynamicSub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: JUCOCH_GREEN }]} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </NativeModal>

      {/* Delete Mood Modal */}
      <NativeModal
        visible={!!deletingMoodId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingMoodId(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.deleteModalCard, { backgroundColor: dynamicCardBg }]} elevation={4}>
            <View style={styles.deleteIconCircle}>
              <AlertTriangle size={24} color="#D90429" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: dynamicText, marginTop: 12, marginBottom: 6 }}>
              Delete Mood Entry?
            </Text>
            <Text style={{ fontSize: 13, color: dynamicSub, textAlign: 'center', marginBottom: 20 }}>
              This will permanently delete this mood log from your timeline, streak, and emotional analytics.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { flex: 1, borderColor: dynamicBorder }]} 
                onPress={() => setDeletingMoodId(null)}
              >
                <Text style={{ color: dynamicSub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.deleteConfirmBtn, { flex: 1 }]} 
                onPress={handleConfirmDelete}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </NativeModal>

      {showConfetti && (
        <View style={styles.confettiContainer}>
          {Array.from({ length: 12 }).map((_, i) => (
            <ConfettiPiece key={i} delay={i * 100} />
          ))}
        </View>
      )}

      <Portal>
        <Modal 
          visible={showModal} 
          onDismiss={() => setShowModal(false)} 
          contentContainerStyle={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowModal(false)}>
              <X size={20} color={dynamicSub} />
            </TouchableOpacity>
            <Text style={styles.modalEmoji}>{selectedMood?.emoji}</Text>
            <Text variant="headlineSmall" style={[styles.modalTitle, { color: dynamicText }]}>How are you feeling?</Text>
            <Text style={[styles.modalDesc, { color: dynamicSub }]}>{selectedMood?.prompt} Do you want to communicate with Jucoch AI now?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.modalBtnOutline, { borderColor: dynamicBorder }]}>
                <Text style={[styles.modalBtnOutlineText, { color: dynamicSub }]}>Maybe later</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowModal(false); router.push('/(tabs)/chat'); }} style={styles.modalBtnSolid}>
                <LinearGradient
                  colors={[JUCOCH_GREEN, '#1B4332']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalBtnGradient}
                >
                  <Text style={styles.modalBtnSolidText}>Talk to AI</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: { marginRight: 16, width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  title: { fontWeight: 'bold' },
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 22, marginBottom: 28, alignItems: 'center', borderWidth: 1 },
  infoIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 20 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moodCard: { width: '31%', paddingVertical: 20, borderRadius: 22, alignItems: 'center', marginBottom: 12, borderWidth: 1.5 },
  emoji: { fontSize: 40, marginBottom: 6 },
  moodLabel: { fontSize: 12, fontWeight: '600' },
  saveButtonWrapper: { marginTop: 12 },
  disabledBtn: { opacity: 0.6 },
  gradientButton: { height: 56, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  gradientButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1000 },
  confettiPiece: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  modalContainer: { padding: 20, justifyContent: 'center' },
  modalContent: { borderRadius: 28, padding: 24, alignItems: 'center', borderWidth: 1 },
  closeIcon: { position: 'absolute', top: 16, right: 16 },
  modalEmoji: { fontSize: 56, marginBottom: 12 },
  modalTitle: { fontWeight: 'bold', textAlign: 'center' },
  modalDesc: { textAlign: 'center', marginTop: 10, lineHeight: 20, fontSize: 13 },
  modalButtons: { flexDirection: 'row', marginTop: 24, justifyContent: 'space-between', width: '100%' },
  modalBtnOutline: { flex: 1, height: 48, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  modalBtnOutlineText: { fontWeight: '600', fontSize: 14 },
  modalBtnSolid: { flex: 1, height: 48, marginLeft: 6 },
  modalBtnGradient: { flex: 1, height: '100%', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalBtnSolidText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#A3D9A5',
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentMoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  recentEmoji: {
    fontSize: 26,
  },
  recentMoodTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentMoodDate: {
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmBtn: {
    backgroundColor: '#D90429',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});