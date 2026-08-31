import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, Avatar, Surface, Divider, Portal, Modal, TextInput, Switch } from 'react-native-paper';
import { 
  ChevronRight, 
  Settings, 
  Shield, 
  Bell, 
  LogOut, 
  Award, 
  BookOpen, 
  Star, 
  ShieldCheck, 
  GraduationCap, 
  Moon, 
  Sun, 
  Compass, 
  X, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Lock, 
  Clock, 
  Heart,
  Copy,
  Smile,
  User,
  CheckCircle,
  Palette
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import AppGuideModal from '@/components/AppGuideModal';

const JUCOCH_GREEN = '#2D6A4F';

const WELLNESS_AVATARS = [
  { id: 'sprout', emoji: '🌿', name: 'Mindful Sprout', desc: 'Growth & Vitality' },
  { id: 'fox', emoji: '🦊', name: 'Clever Fox', desc: 'Adaptable & Calm' },
  { id: 'panda', emoji: '🐼', name: 'Zen Panda', desc: 'Peace & Balance' },
  { id: 'owl', emoji: '🦉', name: 'Wise Owl', desc: 'Insight & Clarity' },
  { id: 'lotus', emoji: '🌸', name: 'Calm Lotus', desc: 'Resilience & Purity' },
  { id: 'lion', emoji: '🦁', name: 'Brave Lion', desc: 'Strength & Courage' },
  { id: 'dolphin', emoji: '🐬', name: 'Peaceful Dolphin', desc: 'Harmony & Joy' },
  { id: 'star', emoji: '🌟', name: 'Bright Star', desc: 'Hope & Radiance' },
  { id: 'meditator', emoji: '🧘', name: 'Zen Meditator', desc: 'Inner Stillness' },
  { id: 'sun', emoji: '🌻', name: 'Sunny Bloom', desc: 'Warmth & Optimism' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    userAlias, 
    userRole, 
    userToken, 
    userAvatar,
    setUserAvatar,
    logout, 
    sleepLogs, 
    moodLogs, 
    activityEntries, 
    journalEntries, 
    getCurrentStreak, 
    getWellnessScore, 
    isDarkMode, 
    toggleDarkMode, 
    setUserAlias, 
    refreshUserData,
    isMasked,
    setIsMasked,
  } = useWellness();

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Settings State
  const [editAliasInput, setEditAliasInput] = useState(userAlias || '');
  const [toastMsg, setToastMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Smart Notifications State
  const [notifDailyCheckin, setNotifDailyCheckin] = useState(true);
  const [notifBedtimePrompt, setNotifBedtimePrompt] = useState(true);
  const [notifStudyBreak, setNotifStudyBreak] = useState(true);
  const [notifAiDistressAlert, setNotifAiDistressAlert] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveAlias = () => {
    if (!editAliasInput.trim()) return;
    setUserAlias(editAliasInput.trim());
    setShowSettingsModal(false);
    showToast('Alias updated successfully!');
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await refreshUserData();
      showToast('Cloud database synchronized!');
    } catch (e) {
      showToast('Failed to sync database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const displayName = userAlias || 'PeacefulUser';
  const displayRole = userRole || 'Individual';
  const isAdmin = displayRole === 'Admin';
  const isStudent = displayRole === 'Student';
  const isGeneralUser = !isAdmin;

  const avgSleep = sleepLogs.length > 0 
    ? (sleepLogs.reduce((sum, log) => sum + log.hours, 0) / sleepLogs.length).toFixed(1)
    : '0.0';

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
      >
        <View style={styles.responsiveWrapper}>
          
          {/* Polished Profile Header */}
          <View style={styles.header}>
            <Surface style={[styles.avatarOutline, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={4}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => setShowAvatarModal(true)}
                style={[styles.avatarCircle, { backgroundColor: isStudent ? '#1E88E5' : JUCOCH_GREEN }]}
              >
                <Text style={styles.avatarLargeEmoji}>{userAvatar || '🌿'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editBadge, { backgroundColor: isStudent ? '#1E88E5' : JUCOCH_GREEN }]}
                onPress={() => setShowAvatarModal(true)}
                activeOpacity={0.8}
              >
                <Sparkles size={14} color="#FFF" />
              </TouchableOpacity>
            </Surface>
            
            <Text variant="headlineSmall" style={[styles.userName, { color: dynamicText }]}>{displayName}</Text>
            <Text variant="bodyMedium" style={[styles.userBio, { color: dynamicSub }]}>{displayRole} Account • Jucoch System</Text>
            
            <View style={styles.badgeRow}>
              {isAdmin ? (
                <Surface style={[styles.statusBadge, { backgroundColor: isDarkMode ? '#244D38' : '#D0E8D8' }]} elevation={0}>
                  <ShieldCheck size={12} color={JUCOCH_GREEN} />
                  <Text style={[styles.statusText, { color: JUCOCH_GREEN }]}>System Administrator</Text>
                </Surface>
              ) : isStudent ? (
                <Surface style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]} elevation={0}>
                  <GraduationCap size={12} color="#1E88E5" />
                  <Text style={[styles.statusText, { color: '#1E88E5' }]}>Student Account</Text>
                </Surface>
              ) : (
                <Surface style={styles.statusBadge} elevation={0}>
                  <Star size={12} color={JUCOCH_GREEN} fill={JUCOCH_GREEN} />
                  <Text style={styles.statusText}>Wellness Member</Text>
                </Surface>
              )}
            </View>
          </View>

          {/* Toast Notification Banner */}
          {!!toastMsg && (
            <Surface style={styles.toastBanner} elevation={3}>
              <CheckCircle size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={styles.toastText}>{toastMsg}</Text>
            </Surface>
          )}

          {/* ROLE-SPECIFIC EXCLUSIVE DASHBOARD */}
          {isAdmin && <AdminDashboard />}

          {/* PERSONAL WELLNESS SECTIONS FOR STUDENT AND INDIVIDUAL ONLY */}
          {isGeneralUser && (
            <>
              {/* Quick Stats */}
              <Surface style={[styles.statsContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <StatBox value={getCurrentStreak().toString()} label="Day Streak" color={isStudent ? '#1E88E5' : JUCOCH_GREEN} />
                <View style={[styles.statDivider, { backgroundColor: dynamicBorder }]} />
                <StatBox value={`${avgSleep}h`} label="Avg Sleep" color="#5F27CD" />
                <View style={[styles.statDivider, { backgroundColor: dynamicBorder }]} />
                <StatBox value={journalEntries.length.toString()} label="Journals" color="#FF9F43" />
              </Surface>

              {/* Wellness Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MY WELLNESS JOURNEY</Text>
                <Surface style={[styles.menuCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                  <MenuItem 
                    icon={BookOpen} 
                    title="Progress Reports" 
                    subtitle="Weekly and Monthly summaries" 
                    onPress={() => setShowReportsModal(true)}
                    dynamicText={dynamicText} 
                    dynamicSub={dynamicSub} 
                  />
                  <Divider style={styles.divider} />
                  <MenuItem 
                    icon={Award} 
                    title="My Achievements" 
                    subtitle={`${getCurrentStreak()} active streak badges`} 
                    onPress={() => setShowAchievementsModal(true)}
                    dynamicText={dynamicText} 
                    dynamicSub={dynamicSub} 
                  />
                </Surface>
              </View>
            </>
          )}

          {/* Preferences & System Settings (Includes Theme Switch) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SYSTEM & PREFERENCES</Text>
            <Surface style={[styles.menuCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
              
              {/* CUSTOM AVATAR PICKER */}
              <MenuItem 
                icon={Palette} 
                title="Anonymous Wellness Avatar" 
                subtitle={`Current: ${userAvatar || '🌿'} (Tap to change)`} 
                onPress={() => setShowAvatarModal(true)} 
                dynamicText={dynamicText} 
                dynamicSub={dynamicSub} 
              />
              <Divider style={styles.divider} />

              {/* ACCOUNT SETTINGS */}
              <MenuItem 
                icon={Settings} 
                title="Account & Display Alias" 
                subtitle={`Alias: ${displayName}`} 
                onPress={() => {
                  setEditAliasInput(userAlias || '');
                  setShowSettingsModal(true);
                }} 
                dynamicText={dynamicText} 
                dynamicSub={dynamicSub} 
              />
              <Divider style={styles.divider} />

              {/* DARK MODE / LIGHT MODE TOGGLE */}
              <View style={styles.themeToggleItem}>
                <View style={styles.menuIconWrapper}>
                  {isDarkMode ? <Moon size={18} color="#FFD166" /> : <Sun size={18} color={JUCOCH_GREEN} />}
                </View>
                <View style={styles.menuTextWrapper}>
                  <Text style={[styles.menuTitle, { color: dynamicText }]}>
                    {isDarkMode ? 'Dark Theme' : 'Light Theme'}
                  </Text>
                  <Text style={[styles.menuSubtitle, { color: dynamicSub }]}>
                    {isDarkMode ? 'Dark UI mode enabled' : 'Light UI mode enabled'}
                  </Text>
                </View>
                <Switch 
                  value={isDarkMode} 
                  onValueChange={toggleDarkMode} 
                  color={JUCOCH_GREEN} 
                />
              </View>

              <Divider style={styles.divider} />
              <MenuItem 
                icon={Compass} 
                title="App Walkthrough & Guide" 
                subtitle="Replay interactive feature tour" 
                onPress={() => setShowGuideModal(true)} 
                dynamicText={dynamicText} 
                dynamicSub={dynamicSub} 
              />
              <Divider style={styles.divider} />
              <MenuItem 
                icon={Shield} 
                title="Privacy Control" 
                subtitle="Anonymous alias & encryption" 
                onPress={() => setShowPrivacyModal(true)}
                dynamicText={dynamicText} 
                dynamicSub={dynamicSub} 
              />
              <Divider style={styles.divider} />
              <MenuItem 
                icon={Bell} 
                title="Smart Notifications" 
                subtitle="Daily check-ins & early alerts" 
                onPress={() => setShowNotificationsModal(true)}
                dynamicText={dynamicText} 
                dynamicSub={dynamicSub} 
              />
            </Surface>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={async () => {
              await logout();
              router.replace('/login');
            }}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#FF6B6B" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out Securely</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Jucoch Platform v2.6.0 • Capstone Edition</Text>
        </View>
      </ScrollView>

      {/* MODAL 0: AVATAR PICKER */}
      <Portal>
        <Modal
          visible={showAvatarModal}
          onDismiss={() => setShowAvatarModal(false)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.modalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Palette size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Choose Your Wellness Avatar</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              Select an anonymous wellness character to represent your private profile.
            </Text>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarGrid}>
                {WELLNESS_AVATARS.map((av) => {
                  const isSelected = userAvatar === av.emoji;
                  return (
                    <TouchableOpacity
                      key={av.id}
                      style={[
                        styles.avatarOptionCard,
                        { backgroundColor: isDarkMode ? '#17221C' : '#F4F9F6', borderColor: dynamicBorder },
                        isSelected && { borderColor: JUCOCH_GREEN, borderWidth: 2, backgroundColor: isDarkMode ? '#1E3528' : '#E8F5EE' }
                      ]}
                      onPress={() => {
                        setUserAvatar(av.emoji);
                        showToast(`Avatar updated to ${av.emoji} ${av.name}!`);
                        setShowAvatarModal(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.avatarOptionEmoji}>{av.emoji}</Text>
                      <Text style={[styles.avatarOptionName, { color: dynamicText }, isSelected && { color: JUCOCH_GREEN, fontWeight: 'bold' }]}>
                        {av.name}
                      </Text>
                      <Text style={[styles.avatarOptionDesc, { color: dynamicSub }]}>{av.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeReportBtn} onPress={() => setShowAvatarModal(false)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 1: ACCOUNT SETTINGS */}
      <Portal>
        <Modal
          visible={showSettingsModal}
          onDismiss={() => setShowSettingsModal(false)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.modalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Settings size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Account & Profile Settings</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              Manage your anonymous display alias and sync your data with the cloud database.
            </Text>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <TextInput
                label="Edit Anonymous Alias"
                value={editAliasInput}
                onChangeText={setEditAliasInput}
                mode="outlined"
                outlineColor={dynamicBorder}
                activeOutlineColor={JUCOCH_GREEN}
                style={[styles.modalInput, { backgroundColor: dynamicCardBg }]}
                textColor={dynamicText}
              />

              <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#1E2E25' : '#E8F5EE', borderColor: dynamicBorder }]}>
                <GraduationCap size={16} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.infoBannerText, { color: dynamicText }]}>
                  Registered Role: <Text style={{ fontWeight: 'bold' }}>{displayRole}</Text>
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.syncButton, { borderColor: dynamicBorder }]}
                onPress={handleManualSync}
                disabled={isSyncing}
              >
                <RefreshCw size={16} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={{ color: JUCOCH_GREEN, fontWeight: 'bold', fontSize: 13 }}>
                  {isSyncing ? 'Syncing with Database...' : 'Sync Cloud Database Now'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.submitModalBtn}
              onPress={handleSaveAlias}
              disabled={!editAliasInput.trim()}
            >
              <Text style={styles.submitModalBtnText}>Save Profile Changes</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 2: PROGRESS REPORTS */}
      <Portal>
        <Modal
          visible={showReportsModal}
          onDismiss={() => setShowReportsModal(false)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.modalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <BookOpen size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Weekly Progress Report</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReportsModal(false)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              Summary of your emotional stability, sleep patterns, and daily habits.
            </Text>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={styles.reportGrid}>
                <View style={[styles.reportCard, { backgroundColor: isDarkMode ? '#1C2920' : '#E8F5EE' }]}>
                  <Clock size={18} color={JUCOCH_GREEN} style={{ marginBottom: 4 }} />
                  <Text style={[styles.reportValue, { color: JUCOCH_GREEN }]}>{avgSleep} hrs</Text>
                  <Text style={[styles.reportLabel, { color: dynamicSub }]}>Avg Sleep Rest</Text>
                </View>

                <View style={[styles.reportCard, { backgroundColor: isDarkMode ? '#1E2538' : '#E3F2FD' }]}>
                  <Smile size={18} color="#1E88E5" style={{ marginBottom: 4 }} />
                  <Text style={[styles.reportValue, { color: '#1E88E5' }]}>{moodLogs.length}</Text>
                  <Text style={[styles.reportLabel, { color: dynamicSub }]}>Mood Check-ins</Text>
                </View>

                <View style={[styles.reportCard, { backgroundColor: isDarkMode ? '#33271A' : '#FFF3E0' }]}>
                  <Award size={18} color="#FF9F43" style={{ marginBottom: 4 }} />
                  <Text style={[styles.reportValue, { color: '#FF9F43' }]}>{getCurrentStreak()} Days</Text>
                  <Text style={[styles.reportLabel, { color: dynamicSub }]}>Active Streak</Text>
                </View>

                <View style={[styles.reportCard, { backgroundColor: isDarkMode ? '#2B1E38' : '#F3E5F5' }]}>
                  <Heart size={18} color="#AB47BC" style={{ marginBottom: 4 }} />
                  <Text style={[styles.reportValue, { color: '#AB47BC' }]}>{journalEntries.length}</Text>
                  <Text style={[styles.reportLabel, { color: dynamicSub }]}>Journal Reflections</Text>
                </View>
              </View>

              <Surface style={[styles.aiInsightCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <Sparkles size={16} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.aiInsightText, { color: dynamicText }]}>
                  {moodLogs.length + sleepLogs.length === 0
                    ? 'AI Evaluation: New Account Baseline (0%). Log your daily mood and sleep to generate personalized AI resilience analytics!'
                    : `AI Evaluation: Your resilience score is at ${getWellnessScore()}%. Consistent sleep and daily reflection support healthy cognitive focus!`}
                </Text>
              </Surface>
            </ScrollView>

            <TouchableOpacity style={styles.closeReportBtn} onPress={() => setShowReportsModal(false)} activeOpacity={0.8}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close Report</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 3: MY ACHIEVEMENTS & BADGES */}
      <Portal>
        <Modal
          visible={showAchievementsModal}
          onDismiss={() => setShowAchievementsModal(false)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.modalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Award size={18} color="#FF9F43" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>My Wellness Achievements</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAchievementsModal(false)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              Earn milestone badges by keeping up with your daily habits and reflections.
            </Text>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <AchievementItem
                title="Consistency Master"
                desc="Maintained a 3+ day streak in the wellness tracker."
                unlocked={getCurrentStreak() >= 3}
                icon="🥉"
                dynamicText={dynamicText}
                dynamicSub={dynamicSub}
              />
              <AchievementItem
                title="Deep Sleep Champion"
                desc="Averaged 7 or more hours of healthy sleep."
                unlocked={parseFloat(avgSleep) >= 7.0}
                icon="🌙"
                dynamicText={dynamicText}
                dynamicSub={dynamicSub}
              />
              <AchievementItem
                title="Mindful Journaler"
                desc="Recorded thoughtful reflections in your encrypted journal."
                unlocked={journalEntries.length >= 1}
                icon="📖"
                dynamicText={dynamicText}
                dynamicSub={dynamicSub}
              />
              <AchievementItem
                title="Campus Scholar"
                desc="Logged academic routines and student activities."
                unlocked={isStudent || activityEntries.length >= 1}
                icon="🎓"
                dynamicText={dynamicText}
                dynamicSub={dynamicSub}
              />
              <AchievementItem
                title="Privacy Shield Pioneer"
                desc="Protected account with 256-bit OTP verification."
                unlocked={true}
                icon="🛡️"
                dynamicText={dynamicText}
                dynamicSub={dynamicSub}
              />
            </ScrollView>

            <TouchableOpacity style={styles.closeReportBtn} onPress={() => setShowAchievementsModal(false)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Awesome!</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 4: PRIVACY CONTROL */}
      <Portal>
        <Modal
          visible={showPrivacyModal}
          onDismiss={() => setShowPrivacyModal(false)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.modalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Shield size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Privacy & Anonymity Control</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              Your student privacy is guaranteed. No real names or emails are ever published.
            </Text>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <View style={styles.privacyItemRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.privacyItemTitle, { color: dynamicText }]}>Mask Alias in Activity Feed</Text>
                  <Text style={[styles.privacyItemSub, { color: dynamicSub }]}>Display as "Anonymous User" instead of your alias.</Text>
                </View>
                <Switch 
                  value={isMasked} 
                  onValueChange={(val) => {
                    setIsMasked(val);
                    showToast(val ? 'Alias masked as "Anonymous User".' : 'Alias visible to group.');
                  }} 
                  color={JUCOCH_GREEN} 
                />
              </View>

              <Divider style={{ marginVertical: 12 }} />

              <View style={[styles.encryptionCard, { backgroundColor: isDarkMode ? '#172B20' : '#E8F5EE' }]}>
                <Lock size={16} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: JUCOCH_GREEN }}>256-Bit Encrypted Storage</Text>
                  <Text style={{ fontSize: 11, color: dynamicSub, marginTop: 2 }}>
                    Reflections and mood check-ins are protected with strict student privacy protocols.
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.exportBtn, { borderColor: dynamicBorder }]}
                onPress={() => showToast('Summary copied to clipboard!')}
              >
                <Copy size={16} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={{ color: JUCOCH_GREEN, fontWeight: 'bold', fontSize: 13 }}>Export My Wellness Summary</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.closeReportBtn} onPress={() => setShowPrivacyModal(false)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 5: SMART NOTIFICATIONS */}
      <Portal>
        <Modal
          visible={showNotificationsModal}
          onDismiss={() => setShowNotificationsModal(false)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.modalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Bell size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Smart Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              Configure personalized wellness reminders and early distress alerts.
            </Text>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <View style={styles.privacyItemRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.privacyItemTitle, { color: dynamicText }]}>Daily Check-In (8:00 AM)</Text>
                  <Text style={[styles.privacyItemSub, { color: dynamicSub }]}>Gentle morning prompt to record how you feel.</Text>
                </View>
                <Switch 
                  value={notifDailyCheckin} 
                  onValueChange={(val) => {
                    setNotifDailyCheckin(val);
                    showToast(val ? 'Morning reminder enabled.' : 'Morning reminder disabled.');
                  }} 
                  color={JUCOCH_GREEN} 
                />
              </View>

              <Divider style={{ marginVertical: 10 }} />

              <View style={styles.privacyItemRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.privacyItemTitle, { color: dynamicText }]}>Sleep Wind-Down (10:00 PM)</Text>
                  <Text style={[styles.privacyItemSub, { color: dynamicSub }]}>Reminder to unwind and prepare for rest.</Text>
                </View>
                <Switch 
                  value={notifBedtimePrompt} 
                  onValueChange={(val) => {
                    setNotifBedtimePrompt(val);
                    showToast(val ? 'Sleep reminder enabled.' : 'Sleep reminder disabled.');
                  }} 
                  color={JUCOCH_GREEN} 
                />
              </View>

              <Divider style={{ marginVertical: 10 }} />

              <View style={styles.privacyItemRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.privacyItemTitle, { color: dynamicText }]}>Study Break & Hydration</Text>
                  <Text style={[styles.privacyItemSub, { color: dynamicSub }]}>Prompts for students during intense study sessions.</Text>
                </View>
                <Switch 
                  value={notifStudyBreak} 
                  onValueChange={(val) => {
                    setNotifStudyBreak(val);
                    showToast(val ? 'Study break alerts enabled.' : 'Study break alerts disabled.');
                  }} 
                  color={JUCOCH_GREEN} 
                />
              </View>

              <Divider style={{ marginVertical: 10 }} />

              <View style={styles.privacyItemRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.privacyItemTitle, { color: dynamicText }]}>AI Early Distress Warnings</Text>
                  <Text style={[styles.privacyItemSub, { color: dynamicSub }]}>Safety tips when continuous stress patterns are detected.</Text>
                </View>
                <Switch 
                  value={notifAiDistressAlert} 
                  onValueChange={(val) => {
                    setNotifAiDistressAlert(val);
                    showToast(val ? 'AI distress alerts active.' : 'AI distress alerts muted.');
                  }} 
                  color={JUCOCH_GREEN} 
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.closeReportBtn} onPress={() => setShowNotificationsModal(false)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save Preferences</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* Guide Modal */}
      <AppGuideModal visible={showGuideModal} onClose={() => setShowGuideModal(false)} />
    </View>
  );
}

function AchievementItem({ title, desc, unlocked, icon, dynamicText, dynamicSub }: any) {
  return (
    <View style={[styles.achievementRow, !unlocked && { opacity: 0.55 }]}>
      <Text style={styles.achievementIcon}>{icon}</Text>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.achievementTitle, { color: dynamicText }]}>{title}</Text>
          {unlocked && (
            <Surface style={styles.unlockedBadge} elevation={0}>
              <Check size={10} color="#2D6A4F" />
              <Text style={styles.unlockedText}>Unlocked</Text>
            </Surface>
          )}
        </View>
        <Text style={[styles.achievementDesc, { color: dynamicSub }]}>{desc}</Text>
      </View>
    </View>
  );
}

function StatBox({ value, label, color }: any) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon: Icon, title, subtitle, dynamicText, dynamicSub, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.menuIconWrapper}>
        <Icon size={18} color={JUCOCH_GREEN} />
      </View>
      <View style={styles.menuTextWrapper}>
        <Text style={[styles.menuTitle, dynamicText && { color: dynamicText }]}>{title}</Text>
        <Text style={[styles.menuSubtitle, dynamicSub && { color: dynamicSub }]}>{subtitle}</Text>
      </View>
      <ChevronRight size={16} color="#CCC" />
    </TouchableOpacity>
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
    paddingBottom: 140,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarOutline: {
    borderRadius: 52,
    padding: 4,
    borderWidth: 2,
    marginBottom: 14,
    position: 'relative',
    elevation: 4,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeEmoji: {
    fontSize: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontWeight: 'bold',
  },
  userBio: {
    marginTop: 2,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#707571',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#909591',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  themeToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextWrapper: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#F0F4F2',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  logoutText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#A0A5A1',
    fontWeight: '600',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#A3D9A5',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  toastText: {
    color: JUCOCH_GREEN,
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  modalContentStyle: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    maxHeight: '88%',
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  modalInput: {
    marginBottom: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoBannerText: {
    fontSize: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  submitModalBtn: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitModalBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
    width: '100%',
  },
  reportCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  aiInsightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  aiInsightText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  closeReportBtn: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  achievementIcon: {
    fontSize: 26,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  achievementDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  unlockedText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    marginLeft: 2,
  },
  privacyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  privacyItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  privacyItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  encryptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 8,
  },
  avatarOptionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 6,
  },
  avatarOptionEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  avatarOptionName: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatarOptionDesc: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
