import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Surface, Avatar, Divider, Searchbar, Portal, Modal, TextInput, ActivityIndicator } from 'react-native-paper';
import { ShieldCheck, Users, GraduationCap, BookOpen, User, Activity, Clock, Smile, Moon, MessageCircle, Zap, UserPlus, CheckCircle, X, Inbox, RefreshCw } from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { API_BASE_URL } from '@/constants/apiConfig';

const JUCOCH_GREEN = '#2D6A4F';

// The 2 Official Creator Admin Accounts
const OFFICIAL_ADMIN_GROUP = [
  { name: 'Admin Conybeare', email: 'conybeared69@gmail.com', alias: 'Admin_Conybeare' },
  { name: 'Admin Christian', email: 'christiancarlmacan@gmail.com', alias: 'Admin_Christian' },
];

export default function AdminDashboard() {
  const { isDarkMode, userToken } = useWellness();

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
            icon: a.action.includes('Mood') ? Smile : a.action.includes('Sleep') ? Moon : Activity,
            color: a.action.includes('Mood') ? '#48BB78' : a.action.includes('Sleep') ? '#5F27CD' : JUCOCH_GREEN,
          })));
        }
      }
    } catch (e) {
      console.log('Fetch Admin Data error:', e);
    } finally {
      setLoading(false);
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
      <View style={[styles.adminHeaderCard, { backgroundColor: isDarkMode ? '#3D171A' : '#FFE5E5', borderColor: isDarkMode ? '#682025' : '#FFC9C9' }]}>
        <View style={styles.iconBg}>
          <ShieldCheck size={22} color="#D90429" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>System Admin Master Panel</Text>
          <Text style={[styles.headerSub, { color: isDarkMode ? '#F8B4B8' : '#707571' }]}>Official Creator Admins ({OFFICIAL_ADMIN_GROUP.length} Members)</Text>
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
            <Divider style={{ marginVertical: 8 }} />

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
                          <Text style={[styles.userName, { color: dynamicText }]}>{u.alias}</Text>
                          <Surface style={[styles.roleBadge, { backgroundColor: `${roleColor}18` }]} elevation={0}>
                            <RoleIcon size={12} color={roleColor} style={{ marginRight: 4 }} />
                            <Text style={[styles.roleBadgeText, { color: roleColor }]}>{u.role}</Text>
                          </Surface>
                        </View>
                        <Text style={[styles.emailText, { color: dynamicSub }]}>{u.email} • Joined {u.joined}</Text>
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
        <Surface style={[styles.listContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
          <View style={styles.feedHeader}>
            <Text style={styles.rosterTitle}>LIVE DAILY USER ACTIVITY FEED</Text>
            <Text style={styles.liveBadge}>● LIVE UPDATES</Text>
          </View>
          <Text style={[styles.feedSubtitle, { color: dynamicSub }]}>Tracks real-time mood logs, sleep logs, and AI chats recorded by users today.</Text>
          <Divider style={{ marginVertical: 10 }} />

          {dailyActivities.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Activity size={32} color={dynamicSub} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyTitle, { color: dynamicText }]}>No Daily Activity Logged Today</Text>
              <Text style={[styles.emptySub, { color: dynamicSub }]}>When users check in, log moods, or chat with AI, their live activities will display here.</Text>
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
                        <Text style={[styles.userName, { color: dynamicText }]}>{act.alias}</Text>
                        <Text style={[styles.activityTime, { color: dynamicSub }]}>{act.time}</Text>
                      </View>
                      <Text style={[styles.actionText, { color: dynamicText }]}>
                        <Text style={{ fontWeight: 'bold', color: act.color }}>{act.action}</Text>: {act.detail}
                      </Text>
                      <Text style={[styles.userRoleTag, { color: dynamicSub }]}>Account Role: {act.role}</Text>
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
        <Surface style={[styles.listContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
          <Text style={styles.rosterTitle}>AUTHORIZED SYSTEM CREATOR ADMINS (2 MEMBERS)</Text>
          <Text style={[styles.feedSubtitle, { color: dynamicSub }]}>Public signups cannot register as Admin. Reserved exclusively for designated creator Gmails.</Text>
          <Divider style={{ marginVertical: 10 }} />

          {OFFICIAL_ADMIN_GROUP.map((admin, index) => (
            <View key={admin.email}>
              {index > 0 && <Divider style={styles.divider} />}
              <View style={styles.userRow}>
                <Avatar.Text size={40} label={`A${index + 1}`} style={{ backgroundColor: '#D90429' }} />
                <View style={styles.userDetails}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.userName, { color: dynamicText }]}>{admin.name}</Text>
                    <Surface style={[styles.roleBadge, { backgroundColor: '#FFE5E5' }]} elevation={0}>
                      <ShieldCheck size={12} color="#D90429" style={{ marginRight: 4 }} />
                      <Text style={[styles.roleBadgeText, { color: '#D90429' }]}>Creator Admin</Text>
                    </Surface>
                  </View>
                  <Text style={[styles.emailText, { color: dynamicSub }]}>{admin.email} • Alias: {admin.alias}</Text>
                </View>
              </View>
            </View>
          ))}
        </Surface>
      )}

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
    color: '#D90429',
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
    backgroundColor: '#D90429',
    borderColor: '#D90429',
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
});
