import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Surface, Avatar, Divider, Searchbar, Portal, Modal, TextInput, ActivityIndicator } from 'react-native-paper';
import { ShieldCheck, Users, GraduationCap, BookOpen, User, Activity, Clock, Smile, Moon, MessageCircle, Zap, UserPlus, CheckCircle, X, Inbox } from 'lucide-react-native';

const JUCOCH_GREEN = '#2D6A4F';

// The 2 Official Creator Admin Accounts
const OFFICIAL_ADMIN_GROUP = [
  { name: 'Admin Conybeare', email: 'conybeared69@gmail.com', alias: 'Admin_Conybeare' },
  { name: 'Admin Christian', email: 'christiancarlmacan@gmail.com', alias: 'Admin_Christian' },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'activity' | 'users' | 'admins'>('users');

  // Clean real-time lists (Dummy accounts removed)
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [dailyActivities, setDailyActivities] = useState<any[]>([]);

  // Modal State for Creating Teacher Account
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teacherAlias, setTeacherAlias] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [classCode, setClassCode] = useState('TEACH-10A');
  const [createdSuccess, setCreatedSuccess] = useState('');

  const filteredUsers = registeredUsers.filter(u => {
    const matchesSearch = u.alias.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const countByRole = (r: string) => registeredUsers.filter(u => u.role === r).length;

  const handleCreateTeacher = () => {
    if (!teacherAlias || !teacherEmail || !teacherPassword) return;
    const newTeacher = {
      id: Date.now().toString(),
      alias: teacherAlias.trim(),
      role: 'Teacher',
      email: teacherEmail.trim(),
      status: 'Active',
      joined: new Date().toISOString().split('T')[0],
    };
    setRegisteredUsers(prev => [newTeacher, ...prev]);
    setCreatedSuccess(`Teacher account '${teacherAlias}' created successfully with Class Code: ${classCode}!`);
    setTimeout(() => {
      setShowCreateModal(false);
      setCreatedSuccess('');
      setTeacherAlias('');
      setTeacherEmail('');
      setTeacherPassword('');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Master Admin Header */}
      <View style={styles.adminHeaderCard}>
        <View style={styles.iconBg}>
          <ShieldCheck size={22} color="#D90429" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>System Admin Master Panel</Text>
          <Text style={styles.headerSub}>Official Creator Admins ({OFFICIAL_ADMIN_GROUP.length} Members)</Text>
        </View>
      </View>

      {/* Overview Stat Counters */}
      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={1}>
          <Text style={styles.statNumber}>{registeredUsers.length + OFFICIAL_ADMIN_GROUP.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </Surface>

        <Surface style={[styles.statCard, { borderColor: '#EBF2EE' }]} elevation={1}>
          <Text style={[styles.statNumber, { color: JUCOCH_GREEN }]}>{countByRole('Individual')}</Text>
          <Text style={styles.statLabel}>Individuals</Text>
        </Surface>

        <Surface style={[styles.statCard, { borderColor: '#BBDEFB' }]} elevation={1}>
          <Text style={[styles.statNumber, { color: '#1E88E5' }]}>{countByRole('Student')}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </Surface>

        <Surface style={[styles.statCard, { borderColor: '#E1BEE7' }]} elevation={1}>
          <Text style={[styles.statNumber, { color: '#8E24AA' }]}>{countByRole('Teacher')}</Text>
          <Text style={styles.statLabel}>Teachers</Text>
        </Surface>
      </View>

      {/* Admin Action Bar */}
      <TouchableOpacity 
        style={styles.createTeacherBtn}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <UserPlus size={16} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.createTeacherBtnText}>+ Issue Teacher Account & Class Code</Text>
      </TouchableOpacity>

      {/* Main Admin Navigation Switcher */}
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'users' && styles.selectedSwitchBtn]}
          onPress={() => setActiveTab('users')}
        >
          <Users size={12} color={activeTab === 'users' ? '#FFF' : '#707571'} style={{ marginRight: 4 }} />
          <Text style={[styles.switchText, activeTab === 'users' && styles.selectedSwitchText]}>
            User Accounts ({registeredUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'activity' && styles.selectedSwitchBtn]}
          onPress={() => setActiveTab('activity')}
        >
          <Activity size={12} color={activeTab === 'activity' ? '#FFF' : '#707571'} style={{ marginRight: 4 }} />
          <Text style={[styles.switchText, activeTab === 'activity' && styles.selectedSwitchText]}>
            Daily Activity ({dailyActivities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeTab === 'admins' && styles.selectedSwitchBtn]}
          onPress={() => setActiveTab('admins')}
        >
          <ShieldCheck size={12} color={activeTab === 'admins' ? '#FFF' : '#707571'} style={{ marginRight: 4 }} />
          <Text style={[styles.switchText, activeTab === 'admins' && styles.selectedSwitchText]}>
            Admins (2)
          </Text>
        </TouchableOpacity>
      </View>

      {/* VIEW 1: REGISTERED ACCOUNTS MANAGEMENT */}
      {activeTab === 'users' && (
        <>
          <Searchbar
            placeholder="Search user alias or email..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={{ fontSize: 13, minHeight: 0 }}
          />

          <View style={styles.filterChipRow}>
            {['All', 'Individual', 'Student', 'Teacher'].map(roleOption => {
              const isSelected = selectedRoleFilter === roleOption;
              return (
                <TouchableOpacity
                  key={roleOption}
                  style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
                  onPress={() => setSelectedRoleFilter(roleOption)}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.selectedFilterChipText]}>
                    {roleOption}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Surface style={styles.listContainer} elevation={2}>
            <Text style={styles.rosterTitle}>REGISTERED ACCOUNTS ({filteredUsers.length})</Text>
            <Divider style={{ marginVertical: 8 }} />

            {filteredUsers.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Inbox size={32} color="#A0A5A1" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No Registered Users Yet</Text>
                <Text style={styles.emptySub}>New user signups (Individuals, Students, Teachers) will appear here in real-time.</Text>
              </View>
            ) : (
              filteredUsers.map((u, index) => {
                const RoleIcon = u.role === 'Student' ? GraduationCap : u.role === 'Teacher' ? BookOpen : User;
                const roleColor = u.role === 'Student' ? '#1E88E5' : u.role === 'Teacher' ? '#8E24AA' : JUCOCH_GREEN;

                return (
                  <View key={u.id}>
                    {index > 0 && <Divider style={styles.divider} />}
                    <View style={styles.userRow}>
                      <Avatar.Text 
                        size={40} 
                        label={u.alias.slice(0, 2).toUpperCase()} 
                        style={{ backgroundColor: roleColor }} 
                      />
                      
                      <View style={styles.userDetails}>
                        <View style={styles.nameRow}>
                          <Text style={styles.userName}>{u.alias}</Text>
                          <Surface style={[styles.roleBadge, { backgroundColor: `${roleColor}18` }]} elevation={0}>
                            <RoleIcon size={12} color={roleColor} style={{ marginRight: 4 }} />
                            <Text style={[styles.roleBadgeText, { color: roleColor }]}>{u.role}</Text>
                          </Surface>
                        </View>
                        <Text style={styles.emailText}>{u.email} • Joined {u.joined}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </Surface>
        </>
      )}

      {/* VIEW 2: DAILY USER ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <Surface style={styles.listContainer} elevation={2}>
          <View style={styles.feedHeader}>
            <Text style={styles.rosterTitle}>LIVE DAILY USER ACTIVITY FEED</Text>
            <Text style={styles.liveBadge}>● LIVE UPDATES</Text>
          </View>
          <Text style={styles.feedSubtitle}>Tracks real-time mood logs, sleep logs, and AI chats recorded by users today.</Text>
          <Divider style={{ marginVertical: 10 }} />

          {dailyActivities.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Activity size={32} color="#A0A5A1" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>No Daily Activity Logged Today</Text>
              <Text style={styles.emptySub}>When users check in, log moods, or chat with AI, their live activities will display here.</Text>
            </View>
          ) : (
            dailyActivities.map((act, index) => {
              const IconComp = act.icon;
              return (
                <View key={act.id}>
                  {index > 0 && <Divider style={styles.divider} />}
                  <View style={styles.activityRow}>
                    <View style={[styles.activityIconBg, { backgroundColor: `${act.color}18` }]}>
                      <IconComp size={18} color={act.color} />
                    </View>

                    <View style={styles.activityDetails}>
                      <View style={styles.nameRow}>
                        <Text style={styles.userName}>{act.alias}</Text>
                        <Text style={styles.activityTime}>{act.time}</Text>
                      </View>
                      <Text style={styles.actionText}>
                        <Text style={{ fontWeight: 'bold', color: act.color }}>{act.action}</Text>: {act.detail}
                      </Text>
                      <Text style={styles.userRoleTag}>Account Role: {act.role}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Surface>
      )}

      {/* VIEW 3: 2 OFFICIAL CREATOR ADMIN GMAIL ACCOUNTS */}
      {activeTab === 'admins' && (
        <Surface style={styles.listContainer} elevation={2}>
          <Text style={styles.rosterTitle}>AUTHORIZED SYSTEM CREATOR ADMINS (2 MEMBERS)</Text>
          <Text style={styles.feedSubtitle}>Public signups cannot register as Admin. Reserved exclusively for designated creator Gmails.</Text>
          <Divider style={{ marginVertical: 10 }} />

          {OFFICIAL_ADMIN_GROUP.map((admin, index) => (
            <View key={admin.email}>
              {index > 0 && <Divider style={styles.divider} />}
              <View style={styles.userRow}>
                <Avatar.Text size={40} label={`A${index + 1}`} style={{ backgroundColor: '#D90429' }} />
                <View style={styles.userDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{admin.name}</Text>
                    <Surface style={[styles.roleBadge, { backgroundColor: '#FFE5E5' }]} elevation={0}>
                      <ShieldCheck size={12} color="#D90429" style={{ marginRight: 4 }} />
                      <Text style={[styles.roleBadgeText, { color: '#D90429' }]}>Creator Admin</Text>
                    </Surface>
                  </View>
                  <Text style={styles.emailText}>{admin.email} • Alias: {admin.alias}</Text>
                </View>
              </View>
            </View>
          ))}
        </Surface>
      )}

      {/* MODAL: CREATE TEACHER ACCOUNT */}
      <Portal>
        <Modal 
          visible={showCreateModal} 
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={styles.createModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Teacher Account</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={20} color="#707571" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Admins issue teacher logins and assign classroom codes for students.</Text>

            {createdSuccess ? (
              <View style={styles.successBox}>
                <CheckCircle size={20} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={styles.successText}>{createdSuccess}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  label="Teacher Name / Alias"
                  value={teacherAlias}
                  onChangeText={setTeacherAlias}
                  mode="outlined"
                  outlineColor="#EBF2EE"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.modalInput}
                  placeholder="e.g. Prof_Johnson"
                />

                <TextInput
                  label="Teacher Email"
                  value={teacherEmail}
                  onChangeText={setTeacherEmail}
                  mode="outlined"
                  outlineColor="#EBF2EE"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.modalInput}
                  placeholder="johnson@school.edu"
                />

                <TextInput
                  label="Temporary Password"
                  value={teacherPassword}
                  onChangeText={setTeacherPassword}
                  secureTextEntry
                  mode="outlined"
                  outlineColor="#EBF2EE"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.modalInput}
                />

                <TextInput
                  label="Classroom Code (For Students to Join)"
                  value={classCode}
                  onChangeText={setClassCode}
                  mode="outlined"
                  outlineColor="#EBF2EE"
                  activeOutlineColor={JUCOCH_GREEN}
                  style={styles.modalInput}
                />

                <TouchableOpacity 
                  style={styles.submitModalBtn}
                  onPress={handleCreateTeacher}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitModalBtnText}>Generate & Issue Teacher Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  adminHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFE5E5',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFC9C9',
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D90429',
  },
  headerSub: {
    fontSize: 11,
    color: '#707571',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF2EE',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  statLabel: {
    fontSize: 9,
    color: '#707571',
    marginTop: 2,
    fontWeight: '600',
  },
  createTeacherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 14,
    elevation: 2,
  },
  createTeacherBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderColor: '#EBF2EE',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 9,
  },
  selectedSwitchBtn: {
    backgroundColor: '#D90429',
    borderColor: '#D90429',
  },
  switchText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#707571',
  },
  selectedSwitchText: {
    color: '#FFF',
  },
  searchBar: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 44,
    marginBottom: 12,
    elevation: 1,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBF2EE',
  },
  selectedFilterChip: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN,
  },
  filterChipText: {
    fontSize: 12,
    color: '#707571',
    fontWeight: '600',
  },
  selectedFilterChipText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EFE7',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rosterTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1,
  },
  liveBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D90429',
  },
  feedSubtitle: {
    fontSize: 11,
    color: '#707571',
    marginTop: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  activityTime: {
    fontSize: 10,
    color: '#909591',
  },
  actionText: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 2,
  },
  userRoleTag: {
    fontSize: 10,
    color: '#808983',
    marginTop: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  emailText: {
    fontSize: 11,
    color: '#707571',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#F0F4F2',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  emptySub: {
    fontSize: 11,
    color: '#707571',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  modalContentStyle: {
    padding: 20,
  },
  createModalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  modalInput: {
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  submitModalBtn: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
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
    marginVertical: 16,
  },
  successText: {
    fontSize: 13,
    color: JUCOCH_GREEN,
    fontWeight: 'bold',
    flex: 1,
  },
});
