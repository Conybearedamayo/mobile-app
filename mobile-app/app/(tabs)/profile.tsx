import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Avatar, Button, Surface, Divider, Portal, Modal, TextInput, Switch } from 'react-native-paper';
import { ChevronRight, Settings, Shield, Bell, LogOut, Award, Zap, BookOpen, Users, Star, ShieldCheck, Key, CheckCircle, GraduationCap, Moon, Sun, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import AppGuideModal from '@/components/AppGuideModal';

const JUCOCH_GREEN = '#2D6A4F';

export default function ProfileScreen() {
  const router = useRouter();
  const { userAlias, userRole, setUserAlias, setUserRole, setUserToken, sleepLogs, journalEntries, getCurrentStreak, isDarkMode, toggleDarkMode } = useWellness();
  const [showGuideModal, setShowGuideModal] = useState(false);

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
              <Avatar.Text size={96} label={displayName.slice(0, 2).toUpperCase()} style={{ backgroundColor: JUCOCH_GREEN }} />
              <TouchableOpacity style={styles.editBadge}>
                <Settings size={14} color="#FFF" />
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

          {/* ROLE-SPECIFIC EXCLUSIVE DASHBOARD */}
          {isAdmin && <AdminDashboard />}

          {/* PERSONAL WELLNESS SECTIONS FOR STUDENT AND INDIVIDUAL ONLY */}
          {isGeneralUser && (
            <>
              {/* Quick Stats */}
              <Surface style={[styles.statsContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <StatBox value={getCurrentStreak().toString()} label="Day Streak" color={JUCOCH_GREEN} />
                <View style={[styles.statDivider, { backgroundColor: dynamicBorder }]} />
                <StatBox value={`${avgSleep}h`} label="Avg Sleep" color="#5F27CD" />
                <View style={[styles.statDivider, { backgroundColor: dynamicBorder }]} />
                <StatBox value={journalEntries.length.toString()} label="Journals" color="#FF9F43" />
              </Surface>

              {/* Wellness Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MY WELLNESS JOURNEY</Text>
                <Surface style={[styles.menuCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                  <MenuItem icon={BookOpen} title="Progress Reports" subtitle="Weekly and Monthly summaries" dynamicText={dynamicText} dynamicSub={dynamicSub} />
                  <Divider style={styles.divider} />
                  <MenuItem icon={Award} title="My Achievements" subtitle={`${getCurrentStreak()} active streak badges`} dynamicText={dynamicText} dynamicSub={dynamicSub} />
                  <Divider style={styles.divider} />
                  <MenuItem icon={Users} title="Wellness Circle" subtitle="Connect with professionals" dynamicText={dynamicText} dynamicSub={dynamicSub} />
                </Surface>
              </View>
            </>
          )}

          {/* Preferences & System Settings (Includes Theme Switch) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SYSTEM & PREFERENCES</Text>
            <Surface style={[styles.menuCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
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
              <MenuItem icon={Shield} title="Privacy Control" subtitle="Anonymous alias & encryption" dynamicText={dynamicText} dynamicSub={dynamicSub} />
              <Divider style={styles.divider} />
              <MenuItem icon={Bell} title="Smart Notifications" subtitle="Early warning alerts" dynamicText={dynamicText} dynamicSub={dynamicSub} />
            </Surface>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              setUserToken(null);
              setUserAlias('');
              setUserRole('');
              router.replace('/login');
            }}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#FF6B6B" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Sign Out Securely</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>JUCOCH AI SYSTEM • BETA v1.0.0</Text>

        </View>
      </ScrollView>

      {/* APP ONBOARDING & GUIDED TOUR MODAL */}
      <AppGuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
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
    paddingBottom: 140, // Expanded padding so content scrolls past bottom tab bar freely
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
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 12,
    width: 26,
    height: 26,
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
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    marginLeft: 4,
  },
  studentCodeCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1565C0',
    letterSpacing: 1,
  },
  codeCardDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  codeHighlight: {
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  updateCodeBtn: {
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  updateCodeBtnText: {
    color: '#1E88E5',
    fontWeight: 'bold',
    fontSize: 12,
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
  codeModalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  modalSub: {
    fontSize: 12,
    color: '#707571',
    marginTop: 4,
    marginBottom: 12,
  },
  modalInput: {
    marginBottom: 14,
    backgroundColor: '#FFF',
  },
  submitModalBtn: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitModalBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 14,
    marginVertical: 12,
  },
  successText: {
    fontSize: 13,
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
    flex: 1,
  },
});
