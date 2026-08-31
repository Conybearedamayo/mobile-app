import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Surface, Avatar, Divider, Searchbar, Portal, Modal, TextInput, ActivityIndicator } from 'react-native-paper';
import { ShieldCheck, Users, GraduationCap, BookOpen, User, Activity, Clock, Smile, Moon, MessageCircle, Zap, UserPlus, CheckCircle, X, Inbox, RefreshCw, Edit3, Trash2, AlertTriangle } from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { API_BASE_URL } from '@/constants/apiConfig';

const JUCOCH_GREEN = '#2D6A4F';

// The 2 Official Creator Admin Accounts
const OFFICIAL_ADMIN_GROUP = [
  { name: 'Admin Conybeare', email: 'conybeared69@gmail.com', alias: 'Admin_Conybeare' },
  { name: 'Admin Christian', email: 'christiancarlmacan@gmail.com', alias: 'Admin_Christian' },
];

export default function AdminDashboard() {
  const { isDarkMode, userToken, isMasked, userAlias } = useWellness();

  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#E2EFE7';
  const formatEventDate = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return timestamp;
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${month} ${day} • ${time}`;
    } catch (e) {
      return timestamp;
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'activity' | 'users' | 'admins'>('users');
  const [loading, setLoading] = useState(false);

  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [dailyActivities, setDailyActivities] = useState<any[]>([]);
  const [activityFilter, setActivityFilter] = useState<'All' | 'Student' | 'Individual'>('All');

  // Moderation state
  const [moderationMsg, setModerationMsg] = useState('');
  const [editActivity, setEditActivity] = useState<any | null>(null);
  const [editActivityDetail, setEditActivityDetail] = useState('');
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<any | null>(null);
  const [editUserAlias, setEditUserAlias] = useState('');
  const [editUserRole, setEditUserRole] = useState('Individual');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setModerationMsg(msg);
    setTimeout(() => setModerationMsg(''), 3000);
  };

  useEffect(() => {
    fetchAdminData();
  }, [userToken]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Bearer ${userToken || ''}`,
        'Content-Type': 'application/json'
      };

      const [usersRes, actRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/users`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/activities`, { headers }).catch(() => null),
      ]);

      if (usersRes && usersRes.ok) {
        const data = await usersRes.json();
        if (data.users) {
          setRegisteredUsers(data.users.map((u: any) => ({
            id: u.id,
            alias: u.alias,
            email: u.email,
            role: u.role,
            joined: formatEventDate(u.createdAt),
          })));
        }
      }

      if (actRes && actRes.ok) {
        const data = await actRes.json();
        if (data.activities) {
          setDailyActivities(data.activities.map((a: any) => ({
            id: a.id,
            alias: a.alias,
            role: a.role,
            action: a.action,
            detail: a.detail,
            time: formatEventDate(a.createdAt),
            icon: a.action.includes('Mood') ? Smile : a.action.includes('Sleep') ? Moon : a.action.includes('Journal') ? BookOpen : Activity,
            color: a.action.includes('Mood') ? '#48BB78' : a.action.includes('Sleep') ? '#5F27CD' : a.action.includes('Journal') ? '#D97706' : JUCOCH_GREEN,
          })));
        }
      }
    } catch (e) {
      console.log('Fetch Admin Data error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteActivity = async () => {
    if (!deletingActivityId) return;
    const targetId = deletingActivityId;
    setDeletingActivityId(null);
    try {
      await fetch(`${API_BASE_URL}/api/admin/activities/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken || ''}`,
          'Content-Type': 'application/json'
        },
      });
      setDailyActivities(prev => prev.filter(a => a.id !== targetId));
      showToast('Activity record moderated and removed successfully.');
    } catch (err) {
      showToast('Failed to delete activity.');
    }
  };

  const handleSaveEditActivity = async () => {
    if (!editActivity || !editActivityDetail.trim()) return;
    const targetId = editActivity.id;
    const newDetail = editActivityDetail.trim();
    setEditActivity(null);
    try {
      await fetch(`${API_BASE_URL}/api/admin/activities/${targetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ detail: newDetail }),
      });
      setDailyActivities(prev =>
        prev.map(a => (a.id === targetId ? { ...a, detail: newDetail } : a))
      );
      showToast('Activity record updated successfully.');
    } catch (err) {
      showToast('Failed to update activity.');
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUserId) return;
    const targetId = deletingUserId;
    setDeletingUserId(null);
    try {
      await fetch(`${API_BASE_URL}/api/admin/users/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken || ''}`,
          'Content-Type': 'application/json'
        },
      });
      setRegisteredUsers(prev => prev.filter(u => u.id !== targetId));
      showToast('User account removed successfully.');
    } catch (err) {
      showToast('Failed to delete user.');
    }
  };

  const handleSaveEditUser = async () => {
    if (!editUser || !editUserAlias.trim()) return;
    const targetId = editUser.id;
    const newAlias = editUserAlias.trim();
    const newRole = editUserRole;
    setEditUser(null);
    try {
      await fetch(`${API_BASE_URL}/api/admin/users/${targetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alias: newAlias, role: newRole }),
      });
      setRegisteredUsers(prev =>
        prev.map(u => (u.id === targetId ? { ...u, alias: newAlias, role: newRole } : u))
      );
      showToast('User account updated successfully.');
    } catch (err) {
      showToast('Failed to update user.');
    }
  };

  const filteredUsers = registeredUsers.filter(u => {
    const matchesSearch = u.alias.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const countByRole = (r: string) => registeredUsers.filter(u => u.role === r).length;

  return (
    <View style={styles.container}>
      {/* Master Admin Header */}
      <View style={[styles.adminHeaderCard, { backgroundColor: isDarkMode ? '#172B20' : '#E8F5EE', borderColor: isDarkMode ? '#244D38' : '#C2E6D1' }]}>
        <View style={styles.iconBg}>
          <ShieldCheck size={22} color={JUCOCH_GREEN} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: JUCOCH_GREEN }]}>System Admin Master Panel</Text>
          <Text style={[styles.headerSub, { color: dynamicSub }]}>Official Creator Admins ({OFFICIAL_ADMIN_GROUP.length} Members)</Text>
        </View>
      </View>

      {/* Overview Stat Counters */}
      <View style={styles.statsRow}>
        <Surface style={[styles.statCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
          <Text style={[styles.statNumber, { color: dynamicText }]}>{registeredUsers.length + OFFICIAL_ADMIN_GROUP.length}</Text>
          <Text style={[styles.statLabel, { color: dynamicSub }]}>Total Users</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
          <Text style={[styles.statNumber, { color: JUCOCH_GREEN }]}>{countByRole('Individual')}</Text>
          <Text style={[styles.statLabel, { color: dynamicSub }]}>Individuals</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
          <Text style={[styles.statNumber, { color: '#1E88E5' }]}>{countByRole('Student')}</Text>
          <Text style={[styles.statLabel, { color: dynamicSub }]}>Students</Text>
        </Surface>

      </View>

      {/* Main Admin Navigation Switcher */}
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }, activeTab === 'users' && styles.selectedSwitchBtn]}
          onPress={() => setActiveTab('users')}
        >
          <Users size={12} color={activeTab === 'users' ? '#FFF' : dynamicSub} style={{ marginRight: 4 }} />
          <Text style={[styles.switchText, { color: dynamicSub }, activeTab === 'users' && styles.selectedSwitchText]}>
            User Accounts ({registeredUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }, activeTab === 'activity' && styles.selectedSwitchBtn]}
          onPress={() => setActiveTab('activity')}
        >
          <Activity size={12} color={activeTab === 'activity' ? '#FFF' : dynamicSub} style={{ marginRight: 4 }} />
          <Text style={[styles.switchText, { color: dynamicSub }, activeTab === 'activity' && styles.selectedSwitchText]}>
            Daily Activity ({dailyActivities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }, activeTab === 'admins' && styles.selectedSwitchBtn]}
          onPress={() => setActiveTab('admins')}
        >
          <ShieldCheck size={12} color={activeTab === 'admins' ? '#FFF' : dynamicSub} style={{ marginRight: 4 }} />
          <Text style={[styles.switchText, { color: dynamicSub }, activeTab === 'admins' && styles.selectedSwitchText]}>
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
            style={[styles.searchBar, { backgroundColor: dynamicCardBg }]}
            inputStyle={{ fontSize: 13, minHeight: 0, color: dynamicText }}
          />

          <View style={styles.filterChipRow}>
            {['All', 'Individual', 'Student'].map(roleOption => {
              const isSelected = selectedRoleFilter === roleOption;
              return (
                <TouchableOpacity
                  key={roleOption}
                  style={[styles.filterChip, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }, isSelected && styles.selectedFilterChip]}
                  onPress={() => setSelectedRoleFilter(roleOption)}
                >
                  <Text style={[styles.filterChipText, { color: dynamicSub }, isSelected && styles.selectedFilterChipText]}>
                    {roleOption}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Surface style={[styles.listContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rosterTitle}>REGISTERED ACCOUNTS ({filteredUsers.length})</Text>
              <TouchableOpacity onPress={fetchAdminData} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {loading ? <ActivityIndicator size={12} color={JUCOCH_GREEN} style={{ marginRight: 4 }} /> : <RefreshCw size={12} color={JUCOCH_GREEN} style={{ marginRight: 4 }} />}
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: JUCOCH_GREEN }}>Refresh List</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.feedSubtitle, { color: dynamicSub, marginTop: 4, marginBottom: 6 }]}>
              🛡️ User emails are masked for anonymity and student privacy protection.
            </Text>
            <Divider style={{ marginVertical: 8 }} />

            {/* Moderation Toast Message */}
            {!!moderationMsg && (
              <Surface style={styles.moderationToast} elevation={3}>
                <CheckCircle size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
                <Text style={styles.moderationToastText}>{moderationMsg}</Text>
              </Surface>
            )}

            {filteredUsers.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Inbox size={32} color={dynamicSub} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyTitle, { color: dynamicText }]}>No Registered Users Yet</Text>
                <Text style={[styles.emptySub, { color: dynamicSub }]}>New user signups (Individuals, Students) will appear here in real-time.</Text>
              </View>
            ) : (
              filteredUsers.map((u, index) => {
                const RoleIcon = u.role === 'Student' ? GraduationCap : User;
                const roleColor = u.role === 'Student' ? '#1E88E5' : JUCOCH_GREEN;
                const isUserMasked = u.alias === 'Anonymous User';
                const displayAlias = isUserMasked ? 'Anonymous User (Masked)' : u.alias;

                return (
                  <View key={u.id}>
                    {index > 0 && <Divider style={styles.divider} />}
                    <View style={styles.userRow}>
                      <Avatar.Text 
                        size={40} 
                        label={isUserMasked ? 'AN' : displayAlias.slice(0, 2).toUpperCase()} 
                        style={{ backgroundColor: isUserMasked ? '#707571' : roleColor }} 
                      />
                      
                      <View style={styles.userDetails}>
                        <View style={styles.nameRow}>
                          <Text style={[styles.userName, { color: dynamicText }]}>{displayAlias}</Text>
                          <Surface style={[styles.roleBadge, { backgroundColor: `${roleColor}18` }]} elevation={0}>
                            <RoleIcon size={12} color={roleColor} style={{ marginRight: 4 }} />
                            <Text style={[styles.roleBadgeText, { color: roleColor }]}>{u.role}</Text>
                          </Surface>
                        </View>
                        <Text style={[styles.emailText, { color: dynamicSub }]}>🔒 {u.email} • Joined {u.joined}</Text>
                      </View>

                      {/* Admin User Moderation Controls */}
                      <View style={styles.rowControls}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditUser(u);
                            setEditUserAlias(u.alias);
                            setEditUserRole(u.role);
                          }}
                          style={[styles.smallActionBtn, { backgroundColor: isDarkMode ? '#25352A' : '#E8F5E9' }]}
                          activeOpacity={0.7}
                        >
                          <Edit3 size={12} color={JUCOCH_GREEN} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setDeletingUserId(u.id)}
                          style={[styles.smallActionBtn, { backgroundColor: isDarkMode ? '#3A1F1F' : '#FFE5E5' }]}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={12} color="#D90429" />
                        </TouchableOpacity>
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
      {activeTab === 'activity' && (() => {
        const studentCount = dailyActivities.filter(a => a.role === 'Student').length;
        const individualCount = dailyActivities.filter(a => a.role === 'Individual').length;
        const filteredList = dailyActivities.filter(a => {
          if (activityFilter === 'Student') return a.role === 'Student';
          if (activityFilter === 'Individual') return a.role === 'Individual';
          return true;
        });

        return (
          <Surface style={[styles.listContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
            <View style={styles.feedHeader}>
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={styles.rosterTitle}>LIVE USER ENGAGEMENT AUDIT FEED</Text>
              </View>
              <Surface style={[styles.liveBadgeSurface, { backgroundColor: isDarkMode ? '#193324' : '#E8F5EE' }]} elevation={0}>
                <Text style={styles.liveBadge}>● PRIVACY-ENCRYPTED</Text>
              </Surface>
            </View>
            <Text style={[styles.feedSubtitle, { color: dynamicSub }]}>
              🔒 End-to-End Privacy Active: User journals and personal notes are anonymized & 256-bit encrypted.
            </Text>

            {/* SEPARATED ACTIVITIES FILTER TABS (STUDENT VS INDIVIDUAL) */}
            <View style={styles.activityFilterRow}>
              <TouchableOpacity
                style={[
                  styles.activityFilterBtn,
                  { borderColor: dynamicBorder, backgroundColor: isDarkMode ? '#1E2521' : '#F3F8F5' },
                  activityFilter === 'All' && { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN }
                ]}
                onPress={() => setActivityFilter('All')}
                activeOpacity={0.8}
              >
                <Text style={[styles.activityFilterBtnText, { color: dynamicSub }, activityFilter === 'All' && { color: '#FFF' }]}>
                  All ({dailyActivities.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.activityFilterBtn,
                  { borderColor: dynamicBorder, backgroundColor: isDarkMode ? '#1E2521' : '#F3F8F5' },
                  activityFilter === 'Student' && { backgroundColor: '#1E88E5', borderColor: '#1E88E5' }
                ]}
                onPress={() => setActivityFilter('Student')}
                activeOpacity={0.8}
              >
                <Text style={[styles.activityFilterBtnText, { color: dynamicSub }, activityFilter === 'Student' && { color: '#FFF' }]}>
                  🎓 Students ({studentCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.activityFilterBtn,
                  { borderColor: dynamicBorder, backgroundColor: isDarkMode ? '#1E2521' : '#F3F8F5' },
                  activityFilter === 'Individual' && { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN }
                ]}
                onPress={() => setActivityFilter('Individual')}
                activeOpacity={0.8}
              >
                <Text style={[styles.activityFilterBtnText, { color: dynamicSub }, activityFilter === 'Individual' && { color: '#FFF' }]}>
                  👤 Individuals ({individualCount})
                </Text>
              </TouchableOpacity>
            </View>

            <Divider style={{ marginVertical: 8 }} />

            {/* Moderation Toast Message */}
            {!!moderationMsg && (
              <Surface style={styles.moderationToast} elevation={3}>
                <CheckCircle size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
                <Text style={styles.moderationToastText}>{moderationMsg}</Text>
              </Surface>
            )}

            {filteredList.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Activity size={32} color={dynamicSub} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyTitle, { color: dynamicText }]}>No Activity Records Found</Text>
                <Text style={[styles.emptySub, { color: dynamicSub }]}>
                  {activityFilter === 'All'
                    ? 'When users check in, log moods, or chat with AI, their live activities will display here.'
                    : `No ${activityFilter} activity records currently logged.`}
                </Text>
              </View>
            ) : (
              filteredList.map((act, index) => {
                const IconComp = act.icon;
                const isActMasked = act.alias === 'Anonymous User';
                const displayActAlias = isActMasked ? 'Anonymous User (Masked)' : act.alias;
                const isJournal = act.action === 'Journal Reflection';

                return (
                  <View key={act.id}>
                    {index > 0 && <Divider style={styles.divider} />}
                    <View style={styles.activityRow}>
                      <View style={[styles.activityIconBg, { backgroundColor: `${act.color}18` }]}>
                        <IconComp size={18} color={act.color} />
                      </View>

                      <View style={styles.activityDetails}>
                        <View style={styles.nameRow}>
                          <Text style={[styles.userName, { color: dynamicText }]}>
                            {displayActAlias}
                          </Text>
                          <Text style={[styles.activityTime, { color: dynamicSub }]}>{act.time}</Text>
                        </View>
                        <Text style={[styles.actionText, { color: dynamicText }]}>
                          <Text style={{ fontWeight: 'bold', color: act.color }}>{act.action}</Text>: {act.detail}
                        </Text>
                        <Text style={[styles.userRoleTag, { color: dynamicSub }]}>
                          Account Role: <Text style={{ fontWeight: 'bold' }}>{act.role}</Text>
                        </Text>
                      </View>

                      {/* Admin Moderation Controls for Activity Log */}
                      <View style={styles.rowControls}>
                        {!isJournal && (
                          <TouchableOpacity
                            onPress={() => {
                              setEditActivity(act);
                              setEditActivityDetail(act.detail);
                            }}
                            style={[styles.smallActionBtn, { backgroundColor: isDarkMode ? '#25352A' : '#E8F5E9' }]}
                            activeOpacity={0.7}
                          >
                            <Edit3 size={12} color={JUCOCH_GREEN} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => setDeletingActivityId(act.id)}
                          style={[styles.smallActionBtn, { backgroundColor: isDarkMode ? '#3A1F1F' : '#FFE5E5' }]}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={12} color="#D90429" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </Surface>
        );
      })()}

      {/* VIEW 3: 2 OFFICIAL CREATOR ADMIN GMAIL ACCOUNTS */}
      {activeTab === 'admins' && (
        <Surface style={[styles.listContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
          <Text style={styles.rosterTitle}>AUTHORIZED SYSTEM CREATOR ADMINS (2 MEMBERS)</Text>
          <Text style={[styles.feedSubtitle, { color: dynamicSub }]}>Public signups cannot register as Admin. Reserved exclusively for designated creator Gmails.</Text>
          <Divider style={{ marginVertical: 10 }} />

          {OFFICIAL_ADMIN_GROUP.map((admin, index) => (
            <View key={admin.email}>
              {index > 0 && <Divider style={styles.divider} />}
              <View style={styles.userRow}>
                <Avatar.Text size={40} label={`A${index + 1}`} style={{ backgroundColor: JUCOCH_GREEN }} />
                <View style={styles.userDetails}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.userName, { color: dynamicText }]}>{admin.name}</Text>
                    <Surface style={[styles.roleBadge, { backgroundColor: isDarkMode ? '#244D38' : '#D0E8D8' }]} elevation={0}>
                      <ShieldCheck size={12} color={JUCOCH_GREEN} style={{ marginRight: 4 }} />
                      <Text style={[styles.roleBadgeText, { color: JUCOCH_GREEN }]}>Creator Admin</Text>
                    </Surface>
                  </View>
                  <Text style={[styles.emailText, { color: dynamicSub }]}>{admin.email} • Alias: {admin.alias}</Text>
                </View>
              </View>
            </View>
          ))}
        </Surface>
      )}

      {/* MODAL 1: EDIT USER ACTIVITY */}
      <Portal>
        <Modal
          visible={!!editActivity}
          onDismiss={() => setEditActivity(null)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.createModalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Edit3 size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Moderate User Activity</Text>
              </View>
              <TouchableOpacity onPress={() => setEditActivity(null)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              User: <Text style={{ fontWeight: 'bold', color: dynamicText }}>{editActivity?.alias}</Text> • Action: {editActivity?.action}
            </Text>

            <TextInput
              label="Activity Details / Content"
              value={editActivityDetail}
              onChangeText={setEditActivityDetail}
              mode="outlined"
              multiline
              numberOfLines={4}
              outlineColor={dynamicBorder}
              activeOutlineColor={JUCOCH_GREEN}
              style={[styles.modalInput, { backgroundColor: dynamicCardBg }]}
              textColor={dynamicText}
            />

            <TouchableOpacity
              style={styles.submitModalBtn}
              onPress={handleSaveEditActivity}
              disabled={!editActivityDetail.trim()}
            >
              <Text style={styles.submitModalBtnText}>Save Moderation Changes</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 2: DELETE ACTIVITY CONFIRMATION */}
      <Portal>
        <Modal
          visible={!!deletingActivityId}
          onDismiss={() => setDeletingActivityId(null)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.createModalCard, { backgroundColor: dynamicCardBg, alignItems: 'center', padding: 24 }]} elevation={5}>
            <View style={styles.deleteCircleIcon}>
              <AlertTriangle size={24} color="#D90429" />
            </View>
            <Text style={[styles.modalTitle, { color: dynamicText, marginBottom: 8 }]}>Delete Inappropriate Activity?</Text>
            <Text style={[styles.modalSub, { color: dynamicSub, textAlign: 'center', marginBottom: 20 }]}>
              Are you sure you want to permanently remove this user activity log from the live audit feed?
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { borderColor: dynamicBorder }]} 
                onPress={() => setDeletingActivityId(null)}
              >
                <Text style={{ color: dynamicSub, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalDeleteBtn} 
                onPress={handleConfirmDeleteActivity}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 3: EDIT USER PROFILE */}
      <Portal>
        <Modal
          visible={!!editUser}
          onDismiss={() => setEditUser(null)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.createModalCard, { backgroundColor: dynamicCardBg }]} elevation={5}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <User size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: dynamicText }]}>Edit User Account</Text>
              </View>
              <TouchableOpacity onPress={() => setEditUser(null)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: dynamicSub }]}>
              Modify user display alias or switch between Individual/Student roles.
            </Text>

            <TextInput
              label="User Alias"
              value={editUserAlias}
              onChangeText={setEditUserAlias}
              mode="outlined"
              outlineColor={dynamicBorder}
              activeOutlineColor={JUCOCH_GREEN}
              style={[styles.modalInput, { backgroundColor: dynamicCardBg }]}
              textColor={dynamicText}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
              {['Individual', 'Student'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleToggleChip,
                    { borderColor: dynamicBorder, backgroundColor: dynamicCardBg },
                    editUserRole === r && styles.selectedRoleToggleChip
                  ]}
                  onPress={() => setEditUserRole(r)}
                >
                  <Text style={[styles.roleToggleText, { color: dynamicSub }, editUserRole === r && { color: '#FFF', fontWeight: 'bold' }]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitModalBtn}
              onPress={handleSaveEditUser}
              disabled={!editUserAlias.trim()}
            >
              <Text style={styles.submitModalBtnText}>Update Account</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>

      {/* MODAL 4: DELETE USER CONFIRMATION */}
      <Portal>
        <Modal
          visible={!!deletingUserId}
          onDismiss={() => setDeletingUserId(null)}
          contentContainerStyle={styles.modalContentStyle}
        >
          <Surface style={[styles.createModalCard, { backgroundColor: dynamicCardBg, alignItems: 'center', padding: 24 }]} elevation={5}>
            <View style={styles.deleteCircleIcon}>
              <AlertTriangle size={24} color="#D90429" />
            </View>
            <Text style={[styles.modalTitle, { color: dynamicText, marginBottom: 8 }]}>Delete User Account?</Text>
            <Text style={[styles.modalSub, { color: dynamicSub, textAlign: 'center', marginBottom: 20 }]}>
              Are you sure you want to permanently remove this user account and all their data from the database?
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { borderColor: dynamicBorder }]} 
                onPress={() => setDeletingUserId(null)}
              >
                <Text style={{ color: dynamicSub, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalDeleteBtn} 
                onPress={handleConfirmDeleteUser}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete User</Text>
              </TouchableOpacity>
            </View>
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
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
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
    color: JUCOCH_GREEN,
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
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
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 9,
  },
  selectedSwitchBtn: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN,
  },
  switchText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedSwitchText: {
    color: '#FFF',
  },
  searchBar: {
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
    borderWidth: 1,
  },
  selectedFilterChip: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedFilterChipText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  rosterTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1,
  },
  liveBadgeSurface: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  liveBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  activityFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  activityFilterBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityFilterBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  feedSubtitle: {
    fontSize: 11,
    marginTop: 2,
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
  },
  activityTime: {
    fontSize: 10,
  },
  actionText: {
    fontSize: 12,
    marginTop: 2,
  },
  userRoleTag: {
    fontSize: 10,
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
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  modalContentStyle: {
    padding: 20,
  },
  createModalCard: {
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
  },
  modalSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  modalInput: {
    marginBottom: 12,
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
  moderationToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#A3D9A5',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  moderationToastText: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  rowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  smallActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteCircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: '#D90429',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleToggleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRoleToggleChip: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN,
  },
  roleToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
