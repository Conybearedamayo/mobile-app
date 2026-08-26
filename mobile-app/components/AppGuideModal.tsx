import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions, 
  Animated, 
  Platform 
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { 
  Smile, 
  Sparkles, 
  Wind, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  HeartPulse, 
  BookOpen, 
  Activity,
  X,
  CheckCircle2,
  Compass
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

interface AppGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SpotlightStep {
  step: number;
  tag: string;
  title: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  headline: string;
  description: string;
  tip: string;
  spotlight: {
    top?: number;
    bottom?: number;
    left?: number | string;
    width: number;
    height: number;
    borderRadius: number;
    label: string;
  };
  cardPosition: 'top' | 'bottom' | 'middle';
}

const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    step: 1,
    tag: 'STEP 1 OF 5 • MOOD & STREAK',
    title: 'Daily Mood Tracking 🎭',
    icon: Smile,
    iconColor: '#48BB78',
    iconBg: '#E8F5E9',
    headline: 'Check in with one tap on the top emojis',
    description: 'Tap an emoji to record your daily emotions. Consistent check-ins build your daily wellness streak and unlock milestone badges.',
    tip: '💡 Pro-Tip: Check in as often as your mood shifts throughout the day.',
    spotlight: {
      top: Platform.OS === 'ios' ? 100 : 75,
      width: Math.min(width - 40, 360),
      height: 85,
      borderRadius: 24,
      label: '1. Daily Mood Emojis & Streak',
    },
    cardPosition: 'bottom',
  },
  {
    step: 2,
    tag: 'STEP 2 OF 5 • AI WELLNESS INDEX',
    title: 'Hero AI Wellness Score 🌟',
    icon: HeartPulse,
    iconColor: '#FF9F43',
    iconBg: '#FFF3E0',
    headline: 'Real-time composite health index',
    description: 'Calculates an emotional resilience score (0–100) combining your sleep hours, check-ins, journal reflections, and daily activities.',
    tip: '💡 Pro-Tip: Maintain 75%+ score for optimal emotional equilibrium.',
    spotlight: {
      top: Platform.OS === 'ios' ? 200 : 175,
      width: Math.min(width - 40, 360),
      height: 140,
      borderRadius: 26,
      label: '2. Hero AI Wellness Index',
    },
    cardPosition: 'bottom',
  },
  {
    step: 3,
    tag: 'STEP 3 OF 5 • DAILY LOGGERS',
    title: 'Categorized Activities & Journal 📝',
    icon: BookOpen,
    iconColor: '#5F27CD',
    iconBg: '#EDE7F6',
    headline: 'Track routines & encrypted reflections',
    description: 'Log activities tailored for Individuals or Students, monitor sleep quality, and write 256-bit encrypted gratitude reflections.',
    tip: '💡 Pro-Tip: Express yourself safely—journals are 100% private.',
    spotlight: {
      top: Platform.OS === 'ios' ? 360 : 330,
      width: Math.min(width - 40, 360),
      height: 110,
      borderRadius: 24,
      label: '3. Activities, Sleep & Journal',
    },
    cardPosition: 'bottom',
  },
  {
    step: 4,
    tag: 'STEP 4 OF 5 • GUIDED BREATHWORK',
    title: 'Guided Box Breathing Tool 🫁',
    icon: Wind,
    iconColor: '#52B788',
    iconBg: '#E8F5EE',
    headline: 'Immediate stress & anxiety relief',
    description: 'A 2-minute visual box breathwork tool with live animated pacing (Inhale 4s ➔ Hold 4s ➔ Exhale 4s ➔ Rest 4s) to soothe your nerves.',
    tip: '💡 Pro-Tip: Use before exams, study sessions, or bedtime.',
    spotlight: {
      top: Platform.OS === 'ios' ? 485 : 455,
      width: Math.min(width - 40, 360),
      height: 95,
      borderRadius: 22,
      label: '4. Live Guided Breathwork Banner',
    },
    cardPosition: 'top',
  },
  {
    step: 5,
    tag: 'STEP 5 OF 5 • 24/7 AI COMPANION',
    title: 'Anonymized AI Companion Chat 🤖',
    icon: Sparkles,
    iconColor: '#1E88E5',
    iconBg: '#E3F2FD',
    headline: '24/7 confidential mental health coach',
    description: 'Tap the Chat Tab below to speak with your private AI companion for coping tips, exam stress advice, and positive affirmations.',
    tip: '💡 Pro-Tip: Identified only by your alias. Zero real names exposed.',
    spotlight: {
      bottom: Platform.OS === 'ios' ? 20 : 10,
      width: 100,
      height: 70,
      borderRadius: 35,
      label: '5. AI Companion Chat Tab',
    },
    cardPosition: 'top',
  },
];

export default function AppGuideModal({ visible, onClose }: AppGuideModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentStep = SPOTLIGHT_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === SPOTLIGHT_STEPS.length - 1;

  useEffect(() => {
    if (!visible) return;

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [visible, currentStepIndex]);

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

  if (!visible) return null;

  const IconComponent = currentStep.icon;
  const spotlightStyle: any = {
    position: 'absolute',
    width: currentStep.spotlight.width,
    height: currentStep.spotlight.height,
    borderRadius: currentStep.spotlight.borderRadius,
    alignSelf: 'center',
    ...(currentStep.spotlight.top !== undefined ? { top: currentStep.spotlight.top } : {}),
    ...(currentStep.spotlight.bottom !== undefined ? { bottom: currentStep.spotlight.bottom } : {}),
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleComplete}
    >
      <View style={styles.overlay}>

        <Animated.View 
          style={[
            styles.spotlightRing, 
            spotlightStyle, 
            { 
              borderColor: currentStep.iconColor,
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <View style={[styles.spotlightCutout, { borderRadius: currentStep.spotlight.borderRadius - 4 }]}>
            <View style={[styles.targetBadge, { backgroundColor: currentStep.iconColor }]}>
              <Text style={styles.targetBadgeText}>🎯 {currentStep.spotlight.label}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.tooltipContainer,
            currentStep.cardPosition === 'top' ? styles.tooltipTop : styles.tooltipBottom,
            { opacity: fadeAnim }
          ]}
        >
          <Surface style={styles.card} elevation={5}>
            
            <View style={styles.topBar}>
              <View style={[styles.stepTag, { backgroundColor: `${currentStep.iconColor}18` }]}>
                <Text style={[styles.stepTagText, { color: currentStep.iconColor }]}>{currentStep.tag}</Text>
              </View>
              <TouchableOpacity onPress={handleComplete} style={styles.skipBtn} activeOpacity={0.7}>
                <Text style={styles.skipBtnText}>Skip Tour ✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featureHeaderRow}>
              <View style={[styles.iconBadge, { backgroundColor: currentStep.iconBg }]}>
                <IconComponent size={24} color={currentStep.iconColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="titleMedium" style={styles.stepTitle}>
                  {currentStep.title}
                </Text>
                <Text style={styles.stepHeadline}>
                  {currentStep.headline}
                </Text>
              </View>
            </View>

            <Text style={styles.stepDescription}>
              {currentStep.description}
            </Text>

            <View style={[styles.tipCard, { backgroundColor: `${currentStep.iconColor}12`, borderColor: `${currentStep.iconColor}30` }]}>
              <Text style={[styles.tipText, { color: '#2D6A4F' }]}>{currentStep.tip}</Text>
            </View>

            <View style={styles.progressDotsContainer}>
              {SPOTLIGHT_STEPS.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentStepIndex
                      ? [styles.activeDot, { backgroundColor: currentStep.iconColor }]
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            <View style={styles.buttonRow}>
              {!isFirstStep ? (
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                  activeOpacity={0.75}
                >
                  <ChevronLeft size={18} color="#707571" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 80 }} />
              )}

              <TouchableOpacity
                onPress={handleNext}
                style={styles.nextButtonWrapper}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[currentStep.iconColor, '#1B4332']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextGradientButton}
                >
                  <Text style={styles.nextButtonText}>
                    {isLastStep ? 'Finish Tour 🎉' : 'Next Step'}
                  </Text>
                  {!isLastStep && <ChevronRight size={18} color="#FFF" style={{ marginLeft: 4 }} />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </Surface>
        </Animated.View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 12, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlightRing: {
    borderWidth: 3,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlightCutout: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  targetBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    elevation: 4,
  },
  targetBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tooltipContainer: {
    position: 'absolute',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  tooltipTop: {
    top: Platform.OS === 'ios' ? 70 : 45,
  },
  tooltipBottom: {
    bottom: Platform.OS === 'ios' ? 80 : 50,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#EBF2EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stepTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipBtnText: {
    fontSize: 11,
    color: '#909591',
    fontWeight: '600',
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  stepHeadline: {
    fontSize: 12,
    color: '#707571',
    marginTop: 2,
  },
  stepDescription: {
    fontSize: 13,
    color: '#333A36',
    lineHeight: 19,
    marginBottom: 12,
  },
  tipCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  tipText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#DDE7E1',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#707571',
    marginLeft: 2,
  },
  nextButtonWrapper: {
    flex: 1,
    maxWidth: 160,
  },
  nextGradientButton: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
