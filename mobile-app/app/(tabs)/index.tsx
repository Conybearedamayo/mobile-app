import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Platform, Animated } from 'react-native';
import { Text, Avatar, Badge, Surface, Portal, Modal } from 'react-native-paper';
import { Smile, Moon, Zap, Activity, ChevronRight, Bell, Sparkles, MessageCircle, HeartPulse, BookOpen, Flame, Compass, X, Wind, CheckCircle2, Play, Pause } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import AppGuideModal from '@/components/AppGuideModal';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

const QUICK_ACTIONS = [
  { id: 'mood', label: 'Log Mood', icon: Smile, color: '#48BB78', route: '/mood-logger', desc: 'How are you feeling?' },
  { id: 'sleep', label: 'Sleep Log', icon: Moon, color: '#5F27CD', route: '/sleep-logger', desc: 'Record rest hours' },
  { id: 'chat', label: 'AI Coach', icon: Sparkles, color: '#1E88E5', route: '/(tabs)/chat', desc: '24/7 AI Companion' },
  { id: 'journal', label: 'Journal', icon: BookOpen, color: '#FF9F43', route: '/journal-logger', desc: 'Reflect & express' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { userAlias, userRole, userAvatar, moodLogs, sleepLogs, activityEntries, wellnessScore, getCurrentStreak, addMoodLog, isDarkMode } = useWellness();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSavedMsg, setMoodSavedMsg] = useState('');
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    const checkFirstTimeTour = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('@jucoch_tour_shown');
        if (!hasSeen) {
          setTimeout(() => {
            setShowGuideModal(true);
          }, 1200);
        }
      } catch (e) {}
    };
    checkFirstTimeTour();
  }, []);

  const handleCloseGuideModal = async () => {
    setShowGuideModal(false);
    try {
      await AsyncStorage.setItem('@jucoch_tour_shown', 'true');
    } catch (e) {}
  };

  // Live Guided Breathing Exercise Timer & Animation State
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const [breatheActive, setBreatheActive] = useState(false);
  const [breatheCycle, setBreatheCycle] = useState(1);
  const [breatheFinished, setBreatheFinished] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: any = null;
    if (showBreathingModal && breatheActive && !breatheFinished) {
      interval = setInterval(() => {
        setBreatheSeconds((prevSec) => {
          if (prevSec > 1) {
            return prevSec - 1;
          }
          // Advance phase
          setBreathePhase((prevPhase) => {
            if (prevPhase === 'Inhale') {
              return 'Hold';
            } else if (prevPhase === 'Hold') {
              return 'Exhale';
            } else if (prevPhase === 'Exhale') {
              return 'Rest';
            } else {
              // Rest finished
              setBreatheCycle((c) => {
                if (c >= 4) {
                  setBreatheActive(false);
                  setBreatheFinished(true);
                  return 4;
                }
                return c + 1;
              });
              return 'Inhale';
            }
          });
          return 4;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showBreathingModal, breatheActive, breatheFinished]);

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    if (!breatheActive || !showBreathingModal || breatheFinished) {
      scaleAnim.setValue(1.0);
      return;
    }
    if (breathePhase === 'Inhale') {
      scaleAnim.setValue(0.85);
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 4000,
        useNativeDriver,
      }).start();
    } else if (breathePhase === 'Hold') {
      scaleAnim.setValue(1.3);
    } else if (breathePhase === 'Exhale') {
      scaleAnim.setValue(1.3);
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 4000,
        useNativeDriver,
      }).start();
    } else if (breathePhase === 'Rest') {
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 4000,
        useNativeDriver,
      }).start();
    }
  }, [breathePhase, breatheActive, showBreathingModal, breatheFinished]);

  const handleOpenBreathingModal = () => {
    setBreathePhase('Inhale');
    setBreatheSeconds(4);
    setBreatheCycle(1);
    setBreatheFinished(false);
    setBreatheActive(true);
    setShowBreathingModal(true);
  };

  const handleCloseBreathingModal = () => {
    setBreatheActive(false);
    setBreatheFinished(false);
    setShowBreathingModal(false);
  };

  const displayName = userAlias || 'User';
  const displayRole = userRole || 'Individual';
  const isAdmin = displayRole === 'Admin';
  const isStudent = displayRole === 'Student';

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#E2EFE7';

  const MOOD_OPTIONS = [
    { label: 'Awful', emoji: '😫', color: '#FF6B6B' },
    { label: 'Bad', emoji: '☹️', color: '#FF9F43' },
    { label: 'Good', emoji: '🙂', color: '#FBC531' },
    { label: 'Great', emoji: '😊', color: '#4BCFFA' },
    { label: 'Amazing', emoji: '🤩', color: '#48BB78' },
  ];

  const handleQuickMoodSelect = (mood: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(mood.label);
    addMoodLog({ id: Date.now(), mood: mood.label, emoji: mood.emoji, timestamp: new Date().toISOString() });
    setMoodSavedMsg(`Recorded your mood as "${mood.label} ${mood.emoji}"!`);
    setTimeout(() => setMoodSavedMsg(''), 2500);
  };

  const totalUserLogs = moodLogs.length + sleepLogs.length + activityEntries.length;

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
      >
        <View style={styles.responsiveWrapper}>
          
          {/* Top Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" style={[styles.greetingText, { color: dynamicSub }]}>Welcome back 👋</Text>
              <Text variant="headlineSmall" style={[styles.welcomeText, { color: dynamicText }]}>
                {isAdmin ? 'Master Control Panel' : displayName}
              </Text>
              <View style={styles.roleBadgeWrapper}>
                <Surface style={[styles.roleBadgeSurface, { backgroundColor: isDarkMode ? '#1E3A2B' : '#E8F5E9' }]} elevation={0}>
                  <Text style={styles.roleBadgeText}>{displayRole} Account</Text>
                </Surface>
                {!isAdmin && (
                  <TouchableOpacity 
                    onPress={() => setShowGuideModal(true)} 
                    style={[styles.tourBadgeSurface, { backgroundColor: isDarkMode ? '#1B382B' : '#E0F2E9' }]}
                    activeOpacity={0.75}
                  >
                    <Compass size={12} color={JUCOCH_GREEN} style={{ marginRight: 4 }} />
                    <Text style={styles.tourBadgeText}>App Guide</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
              <Surface style={[styles.avatarSurface, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={3}>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: isStudent ? '#E3F2FD' : '#E8F5EE', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 26 }}>{userAvatar || '🌿'}</Text>
                </View>
                <Badge style={styles.onlineBadge} size={12} />
              </Surface>
            </TouchableOpacity>
          </View>

          {/* ROLE SPECIFIC EXCLUSIVE DASHBOARD FOR ADMIN */}
          {isAdmin ? (
            <AdminDashboard />
          ) : (
            /* PERSONAL WELLNESS DASHBOARD FOR STUDENT AND INDIVIDUAL ONLY */
            <>
              {/* Daily Quote Banner */}
              <Surface style={[styles.motivationCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <View style={styles.motivationIconBg}>
                  <Sparkles size={18} color={JUCOCH_GREEN} />
                </View>
                <Text style={[styles.motivationText, { color: dynamicSub }]}>
                  "Your mental health is a priority. Your self-care is an essential necessity."
                </Text>
              </Surface>

              {/* High-Impact AI Wellness Hero Card */}
              <TouchableOpacity activeOpacity={0.92} onPress={() => router.push('/(tabs)/insights')}>
                <LinearGradient
                  colors={['#1B4332', '#2D6A4F', '#40916C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroCardGradient}
                >
                  <View style={styles.heroHeader}>
                    <View style={styles.heroTag}>
                      <Activity size={12} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.heroTagText}>AI WELLNESS INDEX</Text>
                    </View>
                    <View style={styles.streakTag}>
                      <Flame size={14} color="#FFB703" fill="#FFB703" style={{ marginRight: 4 }} />
                      <Text style={styles.streakTagText}>{getCurrentStreak()} Day Streak</Text>
                    </View>
                  </View>

                  <View style={styles.heroMainRow}>
                    <View style={styles.scoreInfo}>
                      <View style={styles.scoreMain}>
                        <Text style={styles.scoreValue}>{wellnessScore}</Text>
                        <Text style={styles.scoreScale}>/100</Text>
                      </View>
                      <Text style={styles.scoreSub}>
                        {totalUserLogs === 0
                          ? '🌱 New user baseline: Log your daily mood or rest to calculate your AI index!'
                          : wellnessScore >= 80 ? '🌟 Excellent emotional balance today!'
                          : wellnessScore >= 60 ? '✨ Stable emotional state. Keep it up!'
                          : '💙 Rest and talk with Jucoch AI for support.'}
                      </Text>
                    </View>

                    <View style={styles.scoreRingWrapper}>
                      <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                          <HeartPulse size={26} color={JUCOCH_GREEN} />
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.heroFooter}>
                    <Text style={styles.heroFooterText}>View Full Analytics & Reports</Text>
                    <ChevronRight size={16} color="#FFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Quick Interactive Mood Check-in Bar */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>QUICK MOOD CHECK-IN</Text>
                  {moodSavedMsg ? (
                    <Text style={styles.moodSavedText}>✓ Saved!</Text>
                  ) : (
                    <Text style={[styles.sectionSub, { color: dynamicSub }]}>Tap how you feel</Text>
                  )}
                </View>

                <Surface style={[styles.moodBarCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
                  {MOOD_OPTIONS.map((m) => {
                    const isSelected = selectedMood === m.label;
                    return (
                      <TouchableOpacity
                        key={m.label}
                        style={[styles.moodItem, isSelected && { backgroundColor: `${m.color}25`, borderColor: m.color }]}
                        onPress={() => handleQuickMoodSelect(m)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                        <Text style={[styles.moodLabel, { color: dynamicSub }, isSelected && { color: m.color, fontWeight: 'bold' }]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </Surface>
              </View>

              {/* Quick Action Navigation Grid */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>WELLNESS TOOLS</Text>
                <View style={styles.quickGrid}>
                  {QUICK_ACTIONS.map((action) => {
                    const IconComp = action.icon;
                    return (
                      <TouchableOpacity
                        key={action.id}
                        style={styles.gridCardWrapper}
                        onPress={() => router.push(action.route as any)}
                        activeOpacity={0.8}
                      >
                        <Surface style={[styles.gridCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
                          <View style={[styles.gridIconBg, { backgroundColor: `${action.color}20` }]}>
                            <IconComp size={22} color={action.color} />
                          </View>
                          <Text style={[styles.gridTitle, { color: dynamicText }]}>{action.label}</Text>
                          <Text style={[styles.gridDesc, { color: dynamicSub }]}>{action.desc}</Text>
                        </Surface>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Breathing Exercise Card */}
              <Surface style={[styles.breathingCard, { backgroundColor: dynamicCardBg, borderColor: isDarkMode ? '#2C3A31' : '#D8F3DC' }]} elevation={2}>
                <View style={styles.breathingLeft}>
                  <View style={styles.windIconBg}>
                    <Wind size={22} color={JUCOCH_GREEN} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.breathingTitle, { color: dynamicText }]}>Guided Breathing Exercise</Text>
                    <Text style={[styles.breathingSub, { color: dynamicSub }]}>Take 2 minutes to calm your vagus nerve and reduce anxiety.</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.startBreatheBtn}
                  onPress={handleOpenBreathingModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startBreatheBtnText}>Start Breath</Text>
                </TouchableOpacity>
              </Surface>
            </>
          )}

        </View>
      </ScrollView>

      {/* MODAL: GUIDED BREATHING EXERCISE WITH LIVE TIMER & ANIMATION */}
      <Portal>
        <Modal
          visible={showBreathingModal}
          onDismiss={handleCloseBreathingModal}
          contentContainerStyle={{ padding: 20 }}
        >
          <Surface style={[styles.breatheModalCard, { backgroundColor: dynamicCardBg }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Guided Box Breathwork</Text>
                <Text style={{ fontSize: 11, color: JUCOCH_GREEN, fontWeight: 'bold', marginTop: 2 }}>
                  Cycle {breatheCycle} of 4
                </Text>
              </View>
              <TouchableOpacity onPress={handleCloseBreathingModal}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>
            
            {breatheFinished ? (
              <View style={styles.breatheCompleteContainer}>
                <View style={[styles.breatheCompleteIconBg, { backgroundColor: isDarkMode ? '#1E3A2B' : '#E8F5E9' }]}>
                  <Sparkles size={40} color={JUCOCH_GREEN} />
                </View>

                <Text variant="titleMedium" style={[styles.breatheCompleteTitle, { color: dynamicText }]}>
                  🌟 Mindful Reset Achieved!
                </Text>

                <Text style={[styles.breatheCompleteDesc, { color: dynamicSub }]}>
                  Great job, <Text style={{ fontWeight: 'bold', color: JUCOCH_GREEN }}>{displayName}</Text>! You successfully completed 4 deep breathing cycles. Your vagus nerve is stimulated, your heart rate is calming down, and your mind is refreshed. 🌿
                </Text>

                <View style={styles.breatheStatRow}>
                  <View style={[styles.breatheStatBox, { backgroundColor: isDarkMode ? '#1A231E' : '#F3F8F5', borderColor: dynamicBorder }]}>
                    <Text style={[styles.breatheStatNum, { color: JUCOCH_GREEN }]}>4 / 4</Text>
                    <Text style={[styles.breatheStatLabel, { color: dynamicSub }]}>Cycles Completed</Text>
                  </View>
                  <View style={[styles.breatheStatBox, { backgroundColor: isDarkMode ? '#1A231E' : '#F3F8F5', borderColor: dynamicBorder }]}>
                    <Text style={[styles.breatheStatNum, { color: '#1E88E5' }]}>64s</Text>
                    <Text style={[styles.breatheStatLabel, { color: dynamicSub }]}>Mindful Rest</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 }}>
                  <TouchableOpacity 
                    style={[styles.restartBreatheBtn, { borderColor: dynamicBorder }]}
                    onPress={handleOpenBreathingModal}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.restartBreatheBtnText, { color: dynamicText }]}>Start Again 🔄</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.startBreatheBtn, { flex: 1, backgroundColor: JUCOCH_GREEN, paddingVertical: 14, alignItems: 'center' }]}
                    onPress={handleCloseBreathingModal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.startBreatheBtnText}>Done 🌿</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.breatheCircleContainer}>
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <LinearGradient
                      colors={
                        breathePhase === 'Inhale' ? ['#2D6A4F', '#52B788'] :
                        breathePhase === 'Hold' ? ['#FF9F43', '#FFB703'] :
                        breathePhase === 'Exhale' ? ['#1E88E5', '#42A5F5'] :
                        ['#48BB78', '#2D6A4F']
                      }
                      style={styles.breatheOuterCircle}
                    >
                      <View style={styles.breatheInnerCircle}>
                        <Wind size={32} color={JUCOCH_GREEN} />
                        <Text style={styles.breatheInstruction}>
                          {breathePhase === 'Inhale' ? 'Inhale...' :
                           breathePhase === 'Hold' ? 'Hold...' :
                           breathePhase === 'Exhale' ? 'Exhale...' : 'Rest...'}
                        </Text>
                        <Text style={styles.breatheSecondsText}>{breatheSeconds}s</Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                </View>

                <Text style={[styles.breatheTipText, { color: dynamicSub }]}>
                  {breathePhase === 'Inhale' ? '🫁 Inhale deeply through your nose...' :
                   breathePhase === 'Hold' ? '⏸️ Hold your breath calmly...' :
                   breathePhase === 'Exhale' ? '💨 Exhale slowly through your mouth...' :
                   '🌿 Relax and prepare for the next cycle...'}
                </Text>

                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                  <TouchableOpacity 
                    style={[styles.startBreatheBtn, { flex: 1, backgroundColor: breatheActive ? '#FF9F43' : JUCOCH_GREEN, paddingVertical: 14, alignItems: 'center' }]}
                    onPress={() => setBreatheActive(!breatheActive)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.startBreatheBtnText}>
                      {breatheActive ? 'Pause Timer' : 'Resume Timer'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.closeBreatheBtn, { flex: 1 }]}
                    onPress={handleCloseBreathingModal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.closeBreatheBtnText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Surface>
        </Modal>
      </Portal>
      {/* APP ONBOARDING & GUIDED TOUR MODAL */}
      <AppGuideModal
        visible={showGuideModal}
        onClose={handleCloseGuideModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 140, // Expanded padding so content scrolls past bottom tab bar freely
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 600, // Centers and limits width nicely on large web/tablet views
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  welcomeText: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  roleBadgeWrapper: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadgeSurface: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  tourBadgeSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C2E6D1',
  },
  tourBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  avatarSurface: {
    borderRadius: 28,
    padding: 2,
    position: 'relative',
    borderWidth: 2,
  },
  onlineBadge: {
    backgroundColor: '#48BB78',
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  motivationCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: JUCOCH_GREEN,
    borderWidth: 1,
  },
  motivationIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  motivationText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 18,
  },
  heroCardGradient: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 24,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakTagText: {
    color: '#FFB703',
    fontSize: 11,
    fontWeight: 'bold',
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scoreScale: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  scoreSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  scoreRingWrapper: {
    marginLeft: 12,
  },
  outerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroFooterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1.2,
  },
  sectionSub: {
    fontSize: 11,
  },
  moodSavedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  moodBarCard: {
    flexDirection: 'row',
    borderRadius: 22,
    padding: 10,
    justifyContent: 'space-around',
    borderWidth: 1,
  },
  moodItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCardWrapper: {
    width: '48%',
    flexGrow: 1,
  },
  gridCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  gridIconBg: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  gridDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  breathingCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
  },
  breathingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  windIconBg: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breathingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  breathingSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  startBreatheBtn: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  startBreatheBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  breatheModalCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  breatheCircleContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  breatheOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  breatheInnerCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breatheInstruction: {
    fontSize: 15,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    marginTop: 4,
  },
  breatheSecondsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    marginTop: 2,
  },
  breatheSub: {
    fontSize: 11,
    color: '#707571',
    marginTop: 2,
  },
  breatheTipText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  closeBreatheBtn: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 18,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  closeBreatheBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  breatheCompleteContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  breatheCompleteIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  breatheCompleteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  breatheCompleteDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  breatheStatRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 18,
  },
  breatheStatBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breatheStatNum: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  breatheStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  restartBreatheBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartBreatheBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
});
