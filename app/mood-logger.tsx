import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, Portal, Modal, Surface } from 'react-native-paper';
import { ChevronLeft, Info, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const MOODS = [
  { label: 'Awful', emoji: '😫', color: '#FF6B6B', prompt: 'I am sorry you are feeling this way. Nganong sad man ka?' },
  { label: 'Bad', emoji: '☹️', color: '#FF9F43', prompt: 'I noticed you are feeling down. Nganong sad man ka?' },
  { label: 'Good', emoji: '🙂', color: '#FBC531', prompt: 'Glad to hear that! What made your day good?' },
  { label: 'Great', emoji: '😊', color: '#4BCFFA', prompt: 'That is awesome! Share the joy?' },
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
  const { addMoodLog, setWellnessScore } = useWellness();
  const theme = useTheme();
  const colors = theme.colors;

  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleMoodSelect = (mood: any) => {
    setSelectedMood(mood);

    if (mood.label === 'Good' || mood.label === 'Great' || mood.label === 'Amazing') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
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

    setShowConfetti(true);
    setTimeout(() => {
      router.back();
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            <ChevronLeft size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View>
            <Text variant="headlineSmall" style={[styles.title, { color: colors.onSurface }]}>Mood Logger</Text>
          </View>
        </View>

        <Surface style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline }]} elevation={1}>
          <View style={[styles.infoIconBg, { backgroundColor: `${colors.primary}15` }]}>
            <Info size={16} color={colors.primary} />
          </View>
          <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>Tracking your mood helps Jucoch AI understand your emotional patterns.</Text>
        </Surface>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>HOW ARE YOU FEELING RIGHT NOW?</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => {
              const isSelected = selectedMood?.label === m.label;
              return (
                <TouchableOpacity
                  key={m.label}
                  style={[
                    styles.moodCard, 
                    { backgroundColor: colors.surface, borderColor: colors.outline },
                    isSelected && { borderColor: m.color, borderWidth: 2, backgroundColor: `${m.color}15` }
                  ]}
                  onPress={() => handleMoodSelect(m)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.emoji, !isSelected && { opacity: 0.7 }]}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: colors.onSurfaceVariant }, isSelected && { color: m.color, fontWeight: 'bold' }]}>{m.label}</Text>
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
            colors={selectedMood ? [colors.primary, '#1B4332'] : ['#CCC', '#BBB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButton, { shadowColor: colors.primary }]}
          >
            <Text style={styles.gradientButtonText}>Save Mood Entry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

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
          theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.4)' } }}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setShowModal(false)}>
              <X size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <Text style={styles.modalEmoji}>{selectedMood?.emoji}</Text>
            <Text variant="headlineSmall" style={[styles.modalTitle, { color: colors.onSurface }]}>Nganong sad man ka?</Text>
            <Text style={[styles.modalDesc, { color: colors.onSurfaceVariant }]}>{selectedMood?.prompt} Do you want to communicate with Jucoch AI now?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.modalBtnOutline, { borderColor: colors.outline }]}>
                <Text style={[styles.modalBtnOutlineText, { color: colors.onSurfaceVariant }]}>Maybe later</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowModal(false); router.push('/(tabs)/chat'); }} style={styles.modalBtnSolid}>
                <LinearGradient
                  colors={[colors.primary, '#1B4332']}
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
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: { marginRight: 16, width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  title: { fontWeight: 'bold' },
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 22, marginBottom: 28, alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8 },
  infoIconBg: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 20 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moodCard: { width: '31%', paddingVertical: 20, borderRadius: 22, alignItems: 'center', marginBottom: 12, borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 6 },
  emoji: { fontSize: 40, marginBottom: 6 },
  moodLabel: { fontSize: 12, fontWeight: '600' },
  saveButtonWrapper: { marginTop: 12 },
  disabledBtn: { opacity: 0.6 },
  gradientButton: { height: 56, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
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
});