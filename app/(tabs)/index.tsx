import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Text, Avatar, Badge, Button, Surface } from 'react-native-paper';
import { Smile, Moon, Zap, Activity, ChevronRight, Bell, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

const MOODS = [
  { label: 'Awful', emoji: '😫', color: '#FF6B6B' },
  { label: 'Bad', emoji: '☹️', color: '#FF9F43' },
  { label: 'Good', emoji: '🙂', color: '#FBC531' },
  { label: 'Great', emoji: '😊', color: '#4BCFFA' },
  { label: 'Amazing', emoji: '🤩', color: '#48BB78' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Modern Header */}
        <View style={styles.header}>
          <View>
            <Text variant="bodyMedium" style={styles.greetingText}>Hello, Jamie 👋</Text>
            <Text variant="headlineSmall" style={styles.welcomeText}>How's your mind today?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
            <Surface style={styles.avatarSurface} elevation={2}>
              <Avatar.Text size={48} label="JD" style={{ backgroundColor: JUCOCH_GREEN }} />
              <Badge style={styles.onlineBadge} size={12} />
            </Surface>
          </TouchableOpacity>
        </View>

        {/* Daily Motivation Card */}
        <Surface style={styles.motivationCard} elevation={0}>
            <Sparkles size={20} color={JUCOCH_GREEN} />
            <Text style={styles.motivationText}>
                "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity."
            </Text>
        </Surface>

        {/* High-Impact Wellness Score */}
        <Surface style={styles.scoreCard} elevation={4}>
            <View style={styles.scoreInfo}>
                <Text style={styles.scoreTitle}>AI WELLNESS SCORE</Text>
                <View style={styles.scoreMain}>
                    <Text style={styles.scoreValue}>78</Text>
                    <View style={styles.trendBadge}>
                        <Text style={styles.trendText}>↑ +6 pts</Text>
                    </View>
                </View>
                <Text style={styles.scoreSub}>Your emotional stability is improving!</Text>
            </View>
            <View style={styles.scoreVisual}>
                <Surface style={styles.outerCircle} elevation={0}>
                    <Surface style={styles.innerCircle} elevation={0}>
                        <Activity size={24} color={JUCOCH_GREEN} />
                    </Surface>
                </Surface>
            </View>
        </Surface>

        {/* Elegant Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon={Smile} value="7.2" label="Mood" color="#48BB78" />
          <StatCard icon={Moon} value="6.4h" label="Sleep" color="#5F27CD" />
          <StatCard icon={Zap} value="11" label="Streak" color="#FF9F43" />
          <StatCard icon={Activity} value="3" label="Logs" color="#FF6B6B" />
        </View>

        {/* Modern Alert Section */}
        <Surface style={styles.warningCard} elevation={1}>
            <View style={styles.warningIconBg}>
                <Bell size={20} color="#FF6B6B" />
            </View>
            <View style={styles.warningTextContent}>
                <Text style={styles.warningTitle}>Early Warning Detected</Text>
                <Text style={styles.warningDesc}>
                    Sleep quality dropped 24%. Let's talk about it.
                </Text>
            </View>
            <IconButton icon={() => <ChevronRight size={20} color="#FF6B6B" />} onPress={() => {}} />
        </Surface>

        {/* User-Friendly Mood Quick Log */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood Quick Log</Text>
            <TouchableOpacity onPress={() => router.push('/mood-logger')}>
                <Text style={styles.seeAll}>See Details</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.emojiRow}>
            {MOODS.map((m) => (
                <TouchableOpacity 
                    key={m.label} 
                    style={styles.emojiItem} 
                    onPress={() => router.push('/mood-logger')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.emojiText}>{m.emoji}</Text>
                    <Text style={styles.emojiLabel}>{m.label}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <Button 
            mode="contained" 
            buttonColor={JUCOCH_GREEN} 
            style={styles.mainActionButton}
            contentStyle={{ height: 56 }}
            onPress={() => router.push('/(tabs)/chat')}
        >
            Start AI Chat Session
        </Button>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon: Icon, value, label, color }: any) {
  return (
    <Surface style={styles.statCard} elevation={1}>
      <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Surface>
  );
}

function IconButton({ icon: Icon, onPress }: any) {
    return (
        <TouchableOpacity style={styles.iconButton} onPress={onPress}>
            <Icon />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    color: '#666',
    fontWeight: '500',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  avatarSurface: {
    borderRadius: 24,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#48BB78',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  motivationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  motivationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  scoreCard: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 56,
    fontWeight: 'bold',
  },
  trendBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  trendText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scoreSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  scoreVisual: {
    marginLeft: 16,
  },
  outerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '23%',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  warningIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  warningTextContent: {
    flex: 1,
  },
  warningTitle: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  warningDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAll: {
    color: JUCOCH_GREEN,
    fontWeight: '600',
    fontSize: 13,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  emojiItem: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    width: '18%',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emojiText: {
    fontSize: 28,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
  },
  mainActionButton: {
    borderRadius: 18,
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  iconButton: {
    padding: 8,
  }
});
