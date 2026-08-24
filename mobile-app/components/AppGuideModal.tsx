import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Smile, Sparkles, Wind, ShieldCheck, ChevronRight, ChevronLeft, HeartPulse } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

interface AppGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    tag: 'STEP 1 OF 5 • MOOD CHECK-IN',
    title: 'Daily Mood Tracking 🎭',
    icon: Smile,
    iconColor: '#48BB78',
    iconBg: '#E8F5E9',
    headline: 'Express how you feel in one tap',
    description: 'Tap an emoji on your home dashboard to quickly record your emotions. Consistent check-ins build your daily wellness streak and unlock self-care achievements.',
    tip: '💡 Tip: You can check in multiple times a day as your feelings change.',
  },
  {
    step: 2,
    tag: 'STEP 2 OF 5 • AI WELLNESS INDEX',
    title: 'Real-Time AI Score 🌟',
    icon: HeartPulse,
    iconColor: '#FF9F43',
    iconBg: '#FFF3E0',
    headline: 'Your emotional health at a glance',
    description: 'The Hero AI Wellness Index calculates an emotional balance score (0–100) based on your sleep quality, mood entries, and wellness journal reflections.',
    tip: '💡 Tip: Aim for 75+ to maintain optimal mental equilibrium.',
  },
  {
    step: 3,
    tag: 'STEP 3 OF 5 • 24/7 AI COMPANION',
    title: 'Google Gemini AI Coach 🤖',
    icon: Sparkles,
    iconColor: '#1E88E5',
    iconBg: '#E3F2FD',
    headline: 'Non-judgmental, confidential support',
    description: 'Chat anytime with your private AI companion. It is strictly guarded for mental health guidance, exam stress, mindfulness exercises, and emotional coping strategies.',
    tip: '💡 Tip: Your conversations are completely private and never logged publicly.',
  },
  {
    step: 4,
    tag: 'STEP 4 OF 5 • GUIDED BREATHWORK',
    title: 'Guided Box Breathing 🫁',
    icon: Wind,
    iconColor: '#52B788',
    iconBg: '#E8F5EE',
    headline: 'Instant calm for your nervous system',
    description: 'Experience our 2-minute visual box breathwork tool with live animated pacing (Inhale 4s ➔ Hold 4s ➔ Exhale 4s ➔ Rest 4s) to quickly alleviate anxiety and tension.',
    tip: '💡 Tip: Great for calming down right before an exam, presentation, or sleep.',
  },
  {
    step: 5,
    tag: 'STEP 5 OF 5 • PRIVACY & ANONYMITY',
    title: 'Anonymous Alias Protection 🔒',
    icon: ShieldCheck,
    iconColor: JUCOCH_GREEN,
    iconBg: '#E8F5E9',
    headline: 'Zero stigma. 100% privacy safe.',
    description: 'You are identified only by your chosen Alias (e.g. BraveHeart24). Your real name and personal email are completely masked from public view and system administrators.',
    tip: '💡 Tip: You can update your alias anytime in your Profile settings.',
  },
];

export default function AppGuideModal({ visible, onClose }: AppGuideModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStepIndex(0);
    onClose();
  };

  const IconComponent = currentStep.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleComplete}
    >
      <View style={styles.overlay}>
        <Surface style={styles.card} elevation={5}>
          
          {/* Top Bar with Step Tag and Skip Button */}
          <View style={styles.topBar}>
            <View style={styles.stepTag}>
              <Text style={styles.stepTagText}>{currentStep.tag}</Text>
            </View>
            <TouchableOpacity onPress={handleComplete} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>Skip Tour</Text>
            </TouchableOpacity>
          </View>

          {/* Feature Spotlight Icon Card */}
          <View style={styles.iconShowcase}>
            <View style={[styles.spotlightOuterRing, { borderColor: `${currentStep.iconColor}35` }]}>
              <View style={[styles.spotlightInnerBg, { backgroundColor: currentStep.iconBg }]}>
                <IconComponent size={42} color={currentStep.iconColor} />
              </View>
            </View>
          </View>

          {/* Title & Content */}
          <Text variant="headlineSmall" style={styles.stepTitle}>
            {currentStep.title}
          </Text>

          <Text style={styles.stepHeadline}>
            {currentStep.headline}
          </Text>

          <Text style={styles.stepDescription}>
            {currentStep.description}
          </Text>

          {/* Interactive Pro-Tip Banner */}
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>{currentStep.tip}</Text>
          </View>

          {/* Progress Indicator Dots */}
          <View style={styles.progressDotsContainer}>
            {TOUR_STEPS.map((stepItem, idx) => {
              const isActive = idx === currentStepIndex;
              return (
                <TouchableOpacity
                  key={stepItem.step}
                  onPress={() => setCurrentStepIndex(idx)}
                  style={[
                    styles.progressDot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>

          {/* Bottom Navigation Buttons */}
          <View style={styles.bottomNavRow}>
            {!isFirstStep ? (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <ChevronLeft size={18} color="#5C6B61" />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              style={[styles.nextBtnWrapper, isFirstStep && { flex: 2 }]}
            >
              <LinearGradient
                colors={['#1B4332', JUCOCH_GREEN, '#2D6A4F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientNextBtn}
              >
                <Text style={styles.nextBtnText}>
                  {isLastStep ? 'Get Started! 🎉' : 'Next Step'}
                </Text>
                {!isLastStep && <ChevronRight size={18} color="#FFF" style={{ marginLeft: 4 }} />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 22, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: width > 400 ? 26 : 20,
    borderWidth: 1.5,
    borderColor: '#D8F3DC',
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C2E6D1',
  },
  stepTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: JUCOCH_GREEN,
    letterSpacing: 0.8,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipBtnText: {
    fontSize: 12,
    color: '#8A9990',
    fontWeight: '600',
  },
  iconShowcase: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  spotlightOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlightInnerBg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1F1D',
    textAlign: 'center',
    marginTop: 4,
  },
  stepHeadline: {
    fontSize: 13,
    fontWeight: '700',
    color: JUCOCH_GREEN,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 13,
    color: '#5C6B61',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  tipCard: {
    backgroundColor: '#F3F8F5',
    borderColor: '#D8F3DC',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  tipText: {
    fontSize: 11,
    color: '#3D5245',
    lineHeight: 16,
    fontWeight: '500',
  },
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    backgroundColor: JUCOCH_GREEN,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#D0DDD5',
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F8F5',
    borderColor: '#E2EFE7',
    borderWidth: 1.5,
    borderRadius: 18,
    height: 48,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C6B61',
    marginLeft: 2,
  },
  nextBtnWrapper: {
    flex: 1.5,
  },
  gradientNextBtn: {
    height: 48,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    paddingHorizontal: 16,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
