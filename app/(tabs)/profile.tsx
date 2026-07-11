import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Avatar, Card, Button, Badge, Surface, Divider } from 'react-native-paper';
import { ChevronRight, Settings, Shield, Bell, LogOut, Award, Zap, BookOpen, Users, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Polished Profile Header */}
      <View style={styles.header}>
        <Surface style={styles.avatarSurface} elevation={4}>
            <Avatar.Text size={100} label="JD" style={{ backgroundColor: JUCOCH_GREEN }} />
            <TouchableOpacity style={styles.editBadge}>
                <Settings size={16} color="#FFF" />
            </TouchableOpacity>
        </Surface>
        
        <Text variant="headlineSmall" style={styles.userName}>BraveHeart24</Text>
        <Text variant="bodyMedium" style={styles.userBio}>Graduate Student • Anonymous User</Text>
        
        <View style={styles.badgeRow}>
          <Surface style={styles.statusBadge} elevation={0}>
            <Star size={14} color={JUCOCH_GREEN} fill={JUCOCH_GREEN} />
            <Text style={styles.statusText}>Wellness Pro</Text>
          </Surface>
          <Surface style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]} elevation={0}>
            <Zap size={14} color="#1E88E5" fill="#1E88E5" />
            <Text style={[styles.statusText, { color: '#1E88E5' }]}>AI Active</Text>
          </Surface>
        </View>
      </View>

      {/* Modern Quick Stats */}
      <Surface style={styles.statsContainer} elevation={1}>
        <StatBox value="11" label="Day Streak" color={JUCOCH_GREEN} />
        <View style={styles.statDivider} />
        <StatBox value="6.4" label="Avg Sleep" color="#5F27CD" />
        <View style={styles.statDivider} />
        <StatBox value="24" label="Journals" color="#FF9F43" />
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

      {/* Security & Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SYSTEM & SECURITY</Text>
        <Surface style={styles.menuCard} elevation={1}>
          <MenuItem icon={Shield} title="Privacy Control" subtitle="Anonymous alias & encryption" />
          <Divider style={styles.divider} />
          <MenuItem icon={Bell} title="Smart Notifications" subtitle="Early warning alerts" />
        </Surface>
      </View>

      <Button 
        mode="outlined" 
        textColor="#FF6B6B" 
        style={styles.logoutButton} 
        contentStyle={styles.logoutContent}
        icon={() => <LogOut size={18} color="#FF6B6B" />}
        onPress={() => router.replace('/login')}
      >
        Sign Out Securely
      </Button>

      <Text style={styles.versionText}>JUCOCH AI SYSTEM • BETA v1.0.0</Text>
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
        <Icon size={20} color={JUCOCH_GREEN} />
      </View>
      <View style={styles.menuTextWrapper}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color="#CCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarSurface: {
    borderRadius: 50,
    marginBottom: 20,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: JUCOCH_GREEN,
    padding: 8,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  userBio: {
    color: '#999',
    marginTop: 4,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 24,
    backgroundColor: '#FFF',
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },
  logoutButton: {
    marginTop: 20,
    borderColor: '#FFDEDE',
    borderWidth: 1.5,
    borderRadius: 16,
  },
  logoutContent: {
    height: 56,
  },
  versionText: {
    textAlign: 'center',
    color: '#CCC',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 40,
  },
});
