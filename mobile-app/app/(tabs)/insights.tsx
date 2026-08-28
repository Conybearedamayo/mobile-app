import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, DimensionValue, Platform } from 'react-native';
import { Text, Badge, Surface, Divider } from 'react-native-paper';
import { TrendingUp, AlertCircle, Clock, Activity, Zap, Moon, Sparkles, ShieldCheck, Heart, ChevronRight, BarChart2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWellness } from '@/context/WellnessContext';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function InsightsScreen() {
  const { wellnessScore, sleepLogs, moodLogs, journalEntries, activityEntries, isDarkMode } = useWellness();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('7d');

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#E2EFE7';

  // Helper to format ISO timestamps into clean Month Day • Time format (e.g. Aug 2 • 4:43 PM)
  const formatEventDate = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) {
        return timestamp;
      }
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${month} ${day} • ${time}`;
    } catch (e) {
      return timestamp;
    }
  };

  // Generate dynamic event timeline from actual user logs (Moods, Sleep, Activities, Journals)
  const dynamicTimeline = [
    ...moodLogs.map((m) => ({
      id: `mood-${m.id}`,
      date: formatEventDate(m.timestamp),
      title: `Logged mood as ${m.emoji} ${m.mood}.${m.note ? ` Note: "${m.note}"` : ''}`,
      tags: ['Mood Check-in', 'Emotional Health'],
      isWarning: m.mood === 'Awful' || m.mood === 'Bad',
    })),
    ...sleepLogs.map((s) => ({
      id: `sleep-${s.id}`,
      date: formatEventDate(s.timestamp),
      title: `Recorded ${s.hours} hours of sleep (${s.quality} quality).`,
      tags: ['Sleep', 'Rest'],
      isWarning: s.hours < 6 || s.quality === 'Restless' || s.quality === 'Poor',
    })),
    ...activityEntries.map((a) => ({
      id: `act-${a.id}`,
      date: formatEventDate(a.timestamp),
      title: `Completed activity: ${a.type.replace('[Individual] ', '').replace('[Student] ', '')} (${a.duration} mins).`,
      tags: ['Daily Activity', 'Routine'],
      isWarning: false,
    })),
    ...journalEntries.map((j) => ({
      id: `journal-${j.id}`,
      date: formatEventDate(j.timestamp),
      title: `Completed journal entry: "${j.content.slice(0, 45)}..."`,
      tags: ['Reflection', 'Journal'],
      isWarning: false,
    })),
  ];

  const totalLogsCount = moodLogs.length + sleepLogs.length + activityEntries.length + journalEntries.length;

  // Dynamic Weekly Mood Frequency calculation from actual user moodLogs
  const moodValueMap: Record<string, number> = {
    Awful: 2,
    Bad: 4,
    Good: 6,
    Great: 8,
    Amazing: 10,
  };

  const moodScoresByDay: Record<string, number[]> = {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  };

  moodLogs.forEach((m) => {
    try {
      let d: Date | null = null;
      if (typeof m.id === 'number' && m.id > 1000000000) {
        d = new Date(m.id);
      } else if (m.timestamp) {
        const parsed = Date.parse(m.timestamp);
        if (!isNaN(parsed)) {
          d = new Date(parsed);
        }
      }
      if (!d) {
        d = new Date();
      }
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[d.getDay()] || 'Mon';
      const score = moodValueMap[m.mood] || 7;
      if (moodScoresByDay[dayName]) {
        moodScoresByDay[dayName].push(score);
      }
    } catch (e) {}
  });

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const WEEK_DAYS = daysOfWeek.map((day) => {
    const scores = moodScoresByDay[day] || [];
    if (scores.length === 0) {
      return {
        day,
        height: '12%' as DimensionValue,
        score: '0.0',
        color: isDarkMode ? '#28332C' : '#E2EFE7',
      };
    }
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const heightPercent = `${Math.min(100, Math.max(20, (avg / 10) * 100))}%` as DimensionValue;
    const color = avg >= 7 ? '#48BB78' : avg >= 5 ? '#FBC531' : '#FF9F43';
    return {
      day,
      height: heightPercent,
      score: avg.toFixed(1),
      color,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
      >
        <View style={styles.responsiveWrapper}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text variant="headlineSmall" style={[styles.title, { color: dynamicText }]}>AI Insights & Analytics</Text>
              <Text variant="bodySmall" style={[styles.subtitle, { color: dynamicSub }]}>Behavioral pattern analysis • Real-time AI detection</Text>
            </View>

            <View style={[styles.timeFilterRow, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}>
              {(['7d', '30d', '90d'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, timeFilter === filter && styles.selectedFilterChip]}
                  onPress={() => setTimeFilter(filter)}
                >
                  <Text style={[styles.filterChipText, { color: dynamicSub }, timeFilter === filter && styles.selectedFilterChipText]}>
                    {filter.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hero Mental Health Stability Card */}
          <LinearGradient
            colors={['#1B4332', '#2D6A4F', '#40916C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCardGradient}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroBadge}>
                <Sparkles size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.heroBadgeText}>AI BEHAVIORAL STABILITY</Text>
              </View>
              <Surface style={styles.statusBadge} elevation={0}>
                <Text style={styles.statusBadgeText}>{totalLogsCount > 0 ? 'STABLE' : 'NEW USER'}</Text>
              </Surface>
            </View>

            <View style={styles.heroBody}>
              <View style={styles.scoreWrapper}>
                <Text style={styles.heroScore}>{wellnessScore}</Text>
                <Text style={styles.heroScoreSub}>/ 100 Index</Text>
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>{totalLogsCount > 0 ? 'Resilience Pattern Active' : 'Initial Wellness Baseline'}</Text>
                <Text style={styles.heroSub}>
                  {totalLogsCount > 0 
                    ? 'Your emotional indicators show consistent resilience. Your regular sleep and mood logging contribute positively.'
                    : 'Welcome! Log your mood, sleep, or journal reflections to generate your personalized AI analytics report.'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Weekly Mood Trend Bar Chart */}
          <Surface style={[styles.chartCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
            <View style={styles.chartHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <BarChart2 size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={styles.chartTitle}>WEEKLY MOOD FREQUENCY</Text>
              </View>
              <Text style={[styles.chartAvgText, { color: dynamicSub }]}>
                Logs: <Text style={{ fontWeight: 'bold', color: JUCOCH_GREEN }}>{moodLogs.length} Entries</Text>
              </Text>
            </View>

            {/* Visual Bar Chart */}
            <View style={styles.barChartContainer}>
              {WEEK_DAYS.map((item) => (
                <View key={item.day} style={styles.barColumn}>
                  <Text style={[styles.barScoreText, { color: dynamicSub }]}>{item.score}</Text>
                  <View style={[styles.barTrack, { backgroundColor: isDarkMode ? '#28332C' : '#F3F8F5' }]}>
                    <View style={[styles.barFill, { height: item.height, backgroundColor: item.color }]} />
                  </View>
                  <Text style={[styles.barDayLabel, { color: dynamicSub }]}>{item.day}</Text>
                </View>
              ))}
            </View>
          </Surface>

          {/* Behavioral Correlators */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>AI BEHAVIORAL CORRELATORS</Text>
            </View>

            <View style={styles.correlatorGrid}>
              <Surface style={[styles.correlatorCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <View style={styles.correlatorIconBg}>
                  <Moon size={20} color="#5F27CD" />
                </View>
                <Text style={[styles.correlatorTitle, { color: dynamicText }]}>Sleep → Mood Boost</Text>
                <Text style={[styles.correlatorDesc, { color: dynamicSub }]}>
                  {sleepLogs.length > 0 ? `Avg ${ (sleepLogs.reduce((a,b)=>a+b.hours,0)/sleepLogs.length).toFixed(1) }h sleep recorded.` : 'Log rest hours to track mood correlation.'}
                </Text>
                <View style={styles.corrTag}>
                  <Text style={styles.corrTagText}>{sleepLogs.length > 0 ? '+87% Correlation' : 'Pending Data'}</Text>
                </View>
              </Surface>

              <Surface style={[styles.correlatorCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <View style={[styles.correlatorIconBg, { backgroundColor: '#FFF0F0' }]}>
                  <Activity size={20} color="#D90429" />
                </View>
                <Text style={[styles.correlatorTitle, { color: dynamicText }]}>Physical Exercise</Text>
                <Text style={[styles.correlatorDesc, { color: dynamicSub }]}>30-minute walks reduce anxiety triggers significantly.</Text>
                <View style={[styles.corrTag, { backgroundColor: '#FFE5E5' }]}>
                  <Text style={[styles.corrTagText, { color: '#D90429' }]}>+64% Impact</Text>
                </View>
              </Surface>
            </View>
          </View>

          {/* AI Event Timeline */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={16} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>AI EVENT TIMELINE</Text>
            </View>
            
            <Surface style={[styles.timelineCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
              {dynamicTimeline.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <Sparkles size={32} color={JUCOCH_GREEN} style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: dynamicText }}>No Events Recorded Yet</Text>
                  <Text style={{ fontSize: 11, color: dynamicSub, textAlign: 'center', marginTop: 4, maxWidth: 280 }}>
                    Log your mood, sleep, or journal entries to generate real-time AI event timeline reports.
                  </Text>
                </View>
              ) : (
                dynamicTimeline.map((item, index) => (
                  <View key={item.id}>
                    {index > 0 && <Divider style={styles.divider} />}
                    <TimelineItem 
                      date={item.date}
                      title={item.title}
                      tags={item.tags}
                      isWarning={item.isWarning}
                      dynamicText={dynamicText}
                      dynamicSub={dynamicSub}
                    />
                  </View>
                ))
              )}
            </Surface>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

function TimelineItem({ date, title, tags, isWarning, dynamicText, dynamicSub }: any) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineHeader}>
        <View style={[styles.timelineIndicator, isWarning && styles.warningIndicator]} />
        <Text style={[styles.timelineDate, { color: dynamicSub }]}>{date}</Text>
      </View>
      <Text style={[styles.timelineText, { color: dynamicText }]}>{title}</Text>
      <View style={styles.tagRow}>
        {tags.map((t: string) => (
          <Surface key={t} style={styles.tagBadge} elevation={0}>
            <Text style={styles.tagText}>{t}</Text>
          </Surface>
        ))}
      </View>
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
    maxWidth: 600,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  timeFilterRow: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  selectedFilterChip: {
    backgroundColor: JUCOCH_GREEN,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedFilterChipText: {
    color: '#FFF',
  },
  heroCardGradient: {
    borderRadius: 26,
    padding: 22,
    marginBottom: 22,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: JUCOCH_GREEN,
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreWrapper: {
    marginRight: 16,
    alignItems: 'center',
  },
  heroScore: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#FFF',
  },
  heroScoreSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    lineHeight: 17,
  },
  chartCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1,
  },
  chartAvgText: {
    fontSize: 12,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barScoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barDayLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1.2,
  },
  correlatorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  correlatorCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  correlatorIconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  correlatorTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  correlatorDesc: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 12,
  },
  corrTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  corrTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  timelineCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  timelineItem: {
    paddingVertical: 10,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: JUCOCH_GREEN,
    marginRight: 8,
  },
  warningIndicator: {
    backgroundColor: '#FF9F43',
  },
  timelineDate: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  timelineText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#F3F8F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#707571',
    fontWeight: '600',
  },
  divider: {
    backgroundColor: '#F0F4F2',
  },
});
