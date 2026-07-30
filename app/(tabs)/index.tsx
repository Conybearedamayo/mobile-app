import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Platform } from 'react-native';
import { Text, Avatar, Badge, Surface, Portal, Modal } from 'react-native-paper';
import { Smile, Moon, Zap, Activity, ChevronRight, Bell, Sparkles, MessageCircle, HeartPulse, BookOpen, Flame, Compass, X, Wind, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';

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
  const { userAlias, userRole, moodLogs, sleepLogs, activityEntries, wellnessScore, getCurrentStreak, addMoodLog } = useWellness();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSavedMsg, setMoodSavedMsg] = useState('');
  const [showBreathingModal, setShowBreathingModal] = useState(false);

  const displayName = userAlias || 'Wellness Explorer';
  const displayRole = userRole || 'Individual';
  const isAdmin = displayRole === 'Admin';
  const isTeacher = displayRole === 'Teacher';

  const MOOD_OPTIONS = [
    { label: 'Awful', emoji: '😫', color: '#FF6B6B' },
    { label: 'Bad', emoji: '☹️', color: '#FF9F43' },
    { label: 'Good', emoji: '🙂', color: '#FBC531' },
    { label: 'Great', emoji: '😊', color: '#4BCFFA' },
    { label: 'Amazing', emoji: '🤩', color: '#48BB78' },
  ];

  const handleQuickMoodSelect = (mood: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(mood.label);
    addMoodLog({ id: Date.now(), mood: mood.label, emoji: mood.emoji, timestamp: 'Just now' });
    setMoodSavedMsg(`Recorded your mood as "${mood.label} ${mood.emoji}"!`);
    setTimeout(() => setMoodSavedMsg(''), 2500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" style={styles.greetingText}>Welcome back 👋</Text>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              {isAdmin ? 'Master Control Panel' : isTeacher ? 'Classroom Overview' : displayName}
            </Text>
            <View style={styles.roleBadgeWrapper}>
              <Surface style={styles.roleBadgeSurface} elevation={0}>
                <Text style={styles.roleBadgeText}>{displayRole} Account</Text>
              </Surface>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
            <Surface style={styles.avatarSurface} elevation={3}>
              <Avatar.Text size={50} label={displayName.slice(0, 2).toUpperCase()} style={{ backgroundColor: JUCOCH_GREEN }} />
              <Badge style={styles.onlineBadge} size={12} />
            </Surface>
          </TouchableOpacity>
        </View>

        {/* ROLE SPECIFIC EXCLUSIVE DASHBOARDS FOR ADMIN AND TEACHER */}
        {isAdmin ? (
          <AdminDashboard />
        ) : isTeacher ? (
          <TeacherDashboard />
        ) : (
          /* PERSONAL WELLNESS DASHBOARD FOR STUDENT AND INDIVIDUAL ONLY */
          <>
            {/* Daily Quote Banner */}
            <Surface style={styles.motivationCard} elevation={1}>
              <View style={styles.motivationIconBg}>
                <Sparkles size={18} color={JUCOCH_GREEN} />
              </View>
              <Text style={styles.motivationText}>
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
                      {wellnessScore >= 80 ? '🌟 Excellent emotional balance today!' : 
                       wellnessScore >= 60 ? '✨ Stable emotional state. Keep it up!' :
                       '💙 Rest and talk with Jucoch AI for support.'}
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
                  <Text style={styles.sectionSub}>Tap how you feel</Text>
                )}
              </View>

              <Surface style={styles.moodBarCard} elevation={2}>
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
                      <Text style={[styles.moodLabel, isSelected && { color: m.color, fontWeight: 'bold' }]}>
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
                      <Surface style={styles.gridCard} elevation={2}>
                        <View style={[styles.gridIconBg, { backgroundColor: `${action.color}15` }]}>
                          <IconComp size={22} color={action.color} />
                        </View>
                        <Text style={styles.gridTitle}>{action.label}</Text>
                        <Text style={styles.gridDesc}>{action.desc}</Text>
                      </Surface>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Breathing Exercise Card */}
            <Surface style={styles.breathingCard} elevation={2}>
              <View style={styles.breathingLeft}>
                <View style={styles.windIconBg}>
                  <Wind size={22} color={JUCOCH_GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.breathingTitle}>Guided Breathing Exercise</Text>
                  <Text style={styles.breathingSub}>Take 2 minutes to calm your vagus nerve and reduce anxiety.</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.startBreatheBtn}
                onPress={() => setShowBreathingModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.startBreatheBtnText}>Start Breath</Text>
              </TouchableOpacity>
            </Surface>
          </>
        )}

      </ScrollView>

      {/* MODAL: GUIDED BREATHING EXERCISE */}
      <Portal>
        <Modal
          visible={showBreathingModal}
          onDismiss={() => setShowBreathingModal(false)}
          contentContainerStyle={{ padding: 20 }}
        >
          <Surface style={styles.breatheModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Guided Breathwork</Text>
              <TouchableOpacity onPress={() => setShowBreathingModal(false)}>
                <X size={20} color="#707571" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.breatheCircleContainer}>
              <LinearGradient
                colors={['#2D6A4F', '#40916C']}
                style={styles.breatheOuterCircle}
              >
                <View style={styles.breatheInnerCircle}>
                  <Wind size={36} color={JUCOCH_GREEN} />
                  <Text style={styles.breatheInstruction}>Inhale...</Text>
                  <Text style={styles.breatheSub}>4 Seconds</Text>
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.breatheTipText}>
              Inhale through your nose for 4 seconds, hold for 4 seconds, and exhale slowly for 4 seconds.
            </Text>

            <TouchableOpacity 
              style={styles.closeBreatheBtn}
              onPress={() => setShowBreathingModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBreatheBtnText}>Complete Exercise</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 110,
    maxWidth: 550,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    color: '#707571',
    fontWeight: '500',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#1C1F1D',
    marginTop: 2,
  },
  roleBadgeWrapper: {
    marginTop: 4,
  },
  roleBadgeSurface: {
    backgroundColor: '#E8F5E9',
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
  avatarSurface: {
    borderRadius: 28,
    padding: 2,
    backgroundColor: '#FFF',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#D8F3DC',
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: JUCOCH_GREEN,
    borderWidth: 1,
    borderColor: '#EBF2EE',
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
    color: '#4A5568',
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
    color: '#707571',
  },
  moodSavedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  moodBarCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 10,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2EFE7',
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
    color: '#707571',
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
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBF2EE',
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
    color: '#1C1F1D',
  },
  gridDesc: {
    fontSize: 11,
    color: '#707571',
    marginTop: 2,
  },
  breathingCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#D8F3DC',
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
    color: '#1C1F1D',
  },
  breathingSub: {
    fontSize: 11,
    color: '#707571',
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
    backgroundColor: '#FFF',
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
    color: '#1C1F1D',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    marginTop: 6,
  },
  breatheSub: {
    fontSize: 11,
    color: '#707571',
    marginTop: 2,
  },
  breatheTipText: {
    fontSize: 12,
    color: '#707571',
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
});
