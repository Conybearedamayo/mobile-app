import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Avatar, Button, Surface, Divider, Portal, Modal, TextInput } from 'react-native-paper';
import { ChevronRight, Settings, Shield, Bell, LogOut, Award, Zap, BookOpen, Users, Star, ShieldCheck, Key, CheckCircle, GraduationCap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

const JUCOCH_GREEN = '#2D6A4F';

export default function ProfileScreen() {
  const router = useRouter();
  const { userAlias, userRole, sleepLogs, journalEntries, getCurrentStreak } = useWellness();

  const displayName = userAlias || 'PeacefulUser';
  const displayRole = userRole || 'Individual';
  const isAdmin = displayRole === 'Admin';
  const isTeacher = displayRole === 'Teacher';
  const isStudent = displayRole === 'Student';
  const isGeneralUser = !isAdmin && !isTeacher;

  // Student class code state
  const [classCode, setClassCode] = useState('TEACH-10A');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [codeSuccessMsg, setCodeSuccessMsg] = useState('');

  const avgSleep = sleepLogs.length > 0 
    ? (sleepLogs.reduce((sum, log) => sum + log.hours, 0) / sleepLogs.length).toFixed(1)
    : '0.0';

  const handleUpdateCode = () => {
    if (!newCodeInput.trim()) return;
    setClassCode(newCodeInput.trim().toUpperCase());
    setCodeSuccessMsg(`Successfully linked to Classroom Code: ${newCodeInput.trim().toUpperCase()}!`);
    setTimeout(() => {
      setShowCodeModal(false);
      setCodeSuccessMsg('');
      setNewCodeInput('');
    }, 1800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* Polished Profile Header */}
      <View style={styles.header}>
        <Surface style={styles.avatarOutline} elevation={4}>
          <Avatar.Text size={96} label={displayName.slice(0, 2).toUpperCase()} style={{ backgroundColor: JUCOCH_GREEN }} />
          <TouchableOpacity style={styles.editBadge}>
            <Settings size={14} color="#FFF" />
          </TouchableOpacity>
        </Surface>
        
        <Text variant="headlineSmall" style={styles.userName}>{displayName}</Text>
        <Text variant="bodyMedium" style={styles.userBio}>{displayRole} Account • Jucoch System</Text>
        
        <View style={styles.badgeRow}>
          {isAdmin ? (
            <Surface style={[styles.statusBadge, { backgroundColor: '#FFE5E5' }]} elevation={0}>
              <ShieldCheck size={12} color="#D90429" />
              <Text style={[styles.statusText, { color: '#D90429' }]}>System Administrator</Text>
            </Surface>
          ) : isTeacher ? (
            <Surface style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]} elevation={0}>
              <BookOpen size={12} color="#1E88E5" />
              <Text style={[styles.statusText, { color: '#1E88E5' }]}>Classroom Educator</Text>
            </Surface>
          ) : isStudent ? (
            <Surface style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]} elevation={0}>
              <GraduationCap size={12} color="#1E88E5" />
              <Text style={[styles.statusText, { color: '#1E88E5' }]}>Classroom Student</Text>
            </Surface>
          ) : (
            <Surface style={styles.statusBadge} elevation={0}>
              <Star size={12} color={JUCOCH_GREEN} fill={JUCOCH_GREEN} />
              <Text style={styles.statusText}>Wellness Member</Text>
            </Surface>
          )}
        </View>
      </View>

      {/* ROLE-SPECIFIC EXCLUSIVE DASHBOARDS */}
      {isAdmin && <AdminDashboard />}
      {isTeacher && <TeacherDashboard />}

      {/* STUDENT CLASSROOM CODE SECTION */}
      {isStudent && (
        <Surface style={styles.studentCodeCard} elevation={2}>
          <View style={styles.codeCardHeader}>
            <Key size={18} color="#1E88E5" style={{ marginRight: 8 }} />
            <Text style={styles.codeCardTitle}>MY CLASSROOM / TEACHER CODE</Text>
          </View>
          <Text style={styles.codeCardDesc}>
            Currently linked to Teacher Code: <Text style={styles.codeHighlight}>{classCode}</Text>
          </Text>
          <TouchableOpacity 
            style={styles.updateCodeBtn} 
            onPress={() => setShowCodeModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.updateCodeBtnText}>Enter / Change Teacher Code</Text>
          </TouchableOpacity>
        </Surface>
      )}

      {/* PERSONAL WELLNESS SECTIONS FOR STUDENT AND INDIVIDUAL ONLY */}
      {isGeneralUser && (
        <>
          {/* Quick Stats */}
          <Surface style={styles.statsContainer} elevation={1}>
            <StatBox value={getCurrentStreak().toString()} label="Day Streak" color={JUCOCH_GREEN} />
            <View style={styles.statDivider} />
            <StatBox value={`${avgSleep}h`} label="Avg Sleep" color="#5F27CD" />
            <View style={styles.statDivider} />
            <StatBox value={journalEntries.length.toString()} label="Journals" color="#FF9F43" />
          </Surface>

          {/* Wellness Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY WELLNESS JOURNEY</Text>
            <Surface style={styles.menuCard} elevation={1}>
              <MenuItem icon={BookOpen} title="Progress Reports" subtitle="Weekly and Monthly summaries" />
              <Divider style={styles.divider} />
              <MenuItem icon={Award} title="My Achievements" subtitle="7 badges earned this month" />
              <Divider style={styles.divider} />
              <MenuItem icon={Users} title="Wellness Circle" subtitle="Connect with professionals" />
            </Surface>
          </View>
        </>
      )}

      {/* Security & Settings (For All Roles) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SYSTEM & SECURITY</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem icon={Shield} title="Privacy Control" subtitle="Anonymous alias & encryption" />
          <Divider style={styles.divider} />
          <MenuItem icon={Bell} title="Smart Notifications" subtitle="Early warning alerts" />
        </Surface>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => router.replace('/login')}
        activeOpacity={0.8}
      >
        <LogOut size={18} color="#FF6B6B" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out Securely</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>JUCOCH AI SYSTEM • BETA v1.0.0</Text>

      {/* MODAL: ENTER / CHANGE TEACHER CODE */}
      <Portal>
        <Modal 
          visible={showCodeModal} 
          onDismiss={() => setShowCodeModal(false)}
          contentContainerStyle={{ padding: 20 }}
        >
          <Surface style={styles.codeModalCard}>
            <Text style={styles.modalTitle}>Join Classroom / Teacher Code</Text>
            <Text style={styles.modalSub}>Enter the code provided by your teacher (e.g. TEACH-10A) to link your account.</Text>

            {codeSuccessMsg ? (
              <View style={styles.successBox}>
                <CheckCircle size={20} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={styles.successText}>{codeSuccessMsg}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  label="Teacher / Classroom Code"
                  value={newCodeInput}
                  onChangeText={setNewCodeInput}
                  mode="outlined"
                  outlineColor="#EBF2EE"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.modalInput}
                  placeholder="e.g. TEACH-10A"
                  left={<TextInput.Icon icon="key-outline" color={JUCOCH_GREEN} />}
                />

                <TouchableOpacity 
                  style={styles.submitModalBtn}
                  onPress={handleUpdateCode}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitModalBtnText}>Link to Teacher Classroom</Text>
                </TouchableOpacity>
              </View>
            )}
          </Surface>
        </Modal>
      </Portal>
    </ScrollView>
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

function MenuItem({ icon: Icon, title, subtitle }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.6}>
      <View style={styles.menuIconWrapper}>
        <Icon size={18} color={JUCOCH_GREEN} />
      </View>
      <View style={styles.menuTextWrapper}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={16} color="#CCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8F5',
  },
  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 110,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarOutline: {
    borderRadius: 52,
    padding: 4,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D8F3DC',
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
    color: '#1C1F1D',
  },
  userBio: {
    color: '#707571',
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#BBDEFB',
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
    color: '#707571',
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF2EE',
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
    backgroundColor: '#EBF2EE',
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EBF2EE',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    color: '#1C1F1D',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#707571',
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
