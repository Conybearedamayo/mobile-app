import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, DimensionValue } from 'react-native';
import { Text, Badge, Surface, Divider } from 'react-native-paper';
import { TrendingUp, AlertCircle, Clock, Activity, Zap, Moon, Sparkles, ShieldCheck, Heart, ChevronRight, BarChart2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWellness } from '@/context/WellnessContext';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function InsightsScreen() {
  const { wellnessScore, sleepLogs, moodLogs } = useWellness();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('7d');

  const WEEK_DAYS: Array<{ day: string; height: DimensionValue; score: string; color: string }> = [
    { day: 'Mon', height: '65%', score: '7.2', color: '#48BB78' },
    { day: 'Tue', height: '80%', score: '8.5', color: '#48BB78' },
    { day: 'Wed', height: '45%', score: '5.4', color: '#FF9F43' },
    { day: 'Thu', height: '90%', score: '9.1', color: '#48BB78' },
    { day: 'Fri', height: '75%', score: '7.8', color: '#48BB78' },
    { day: 'Sat', height: '85%', score: '8.8', color: '#48BB78' },
    { day: 'Sun', height: '70%', score: '7.0', color: '#48BB78' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.title}>AI Insights & Analytics</Text>
          <Text variant="bodySmall" style={styles.subtitle}>Behavioral pattern analysis • Real-time AI detection</Text>
        </View>

        <View style={styles.timeFilterRow}>
          {(['7d', '30d', '90d'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, timeFilter === filter && styles.selectedFilterChip]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text style={[styles.filterChipText, timeFilter === filter && styles.selectedFilterChipText]}>
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
            <Text style={styles.statusBadgeText}>STABLE</Text>
          </Surface>
        </View>

        <View style={styles.heroBody}>
          <View style={styles.scoreWrapper}>
            <Text style={styles.heroScore}>{wellnessScore}</Text>
            <Text style={styles.heroScoreSub}>/ 100 Index</Text>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>Low Risk Pattern Detected</Text>
            <Text style={styles.heroSub}>
              Your emotional indicators show consistent resilience. Your regular sleep schedule is contributing positively to stress management.
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Weekly Mood Trend Bar Chart */}
      <Surface style={styles.chartCard} elevation={2}>
        <View style={styles.chartHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BarChart2 size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
            <Text style={styles.chartTitle}>WEEKLY MOOD FREQUENCY</Text>
          </View>
          <Text style={styles.chartAvgText}>Avg: <Text style={{ fontWeight: 'bold', color: JUCOCH_GREEN }}>7.7/10</Text></Text>
        </View>

        {/* Visual Bar Chart */}
        <View style={styles.barChartContainer}>
          {WEEK_DAYS.map((item) => (
            <View key={item.day} style={styles.barColumn}>
              <Text style={styles.barScoreText}>{item.score}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: item.height, backgroundColor: item.color }]} />
              </View>
              <Text style={styles.barDayLabel}>{item.day}</Text>
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
          <Surface style={styles.correlatorCard} elevation={1}>
            <View style={styles.correlatorIconBg}>
              <Moon size={20} color="#5F27CD" />
            </View>
            <Text style={styles.correlatorTitle}>Sleep → Mood Boost</Text>
            <Text style={styles.correlatorDesc}>+0.8 mood increase for every extra 1 hour of restful sleep.</Text>
            <View style={styles.corrTag}>
              <Text style={styles.corrTagText}>+87% Correlation</Text>
            </View>
          </Surface>

          <Surface style={styles.correlatorCard} elevation={1}>
            <View style={[styles.correlatorIconBg, { backgroundColor: '#FFF0F0' }]}>
              <Activity size={20} color="#D90429" />
            </View>
            <Text style={styles.correlatorTitle}>Physical Exercise</Text>
            <Text style={styles.correlatorDesc}>30-minute walks reduce anxiety triggers significantly.</Text>
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
        
        <Surface style={styles.timelineCard} elevation={2}>
          <TimelineItem 
            date="Today • 9:04 AM"
            title="Mood trend improving. Guided breathing exercises 3 days in a row — positive impact confirmed."
            tags={['Self-Care', 'Progress']}
          />
          <Divider style={styles.divider} />
          <TimelineItem 
            date="Yesterday • 11:45 PM"
            title="Late bed time detected. 6.2 hours sleep recorded."
            tags={['Sleep', 'Rest']}
            isWarning
          />
          <Divider style={styles.divider} />
          <TimelineItem 
            date="2 Days Ago • 3:12 PM"
            title="Completed gratitude journal entry. Stress levels stabilized."
            tags={['Reflection', 'Journal']}
          />
        </Surface>
      </View>
    </ScrollView>
  );
}

function TimelineItem({ date, title, tags, isWarning }: any) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineHeader}>
        <View style={[styles.timelineIndicator, isWarning && styles.warningIndicator]} />
        <Text style={styles.timelineDate}>{date}</Text>
      </View>
      <Text style={styles.timelineText}>{title}</Text>
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
    backgroundColor: '#F3F8F5',
  },
  content: {
    padding: 20,
    paddingTop: 50,
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
  title: {
    fontWeight: 'bold',
    color: '#1C1F1D',
  },
  subtitle: {
    color: '#707571',
    marginTop: 2,
    fontSize: 12,
  },
  timeFilterRow: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBF2EE',
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
    color: '#707571',
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
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2EFE7',
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
    color: '#707571',
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
    color: '#707571',
    marginBottom: 6,
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: '#F3F8F5',
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
    color: '#707571',
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
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBF2EE',
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
    color: '#1C1F1D',
  },
  correlatorDesc: {
    fontSize: 11,
    color: '#707571',
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
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EFE7',
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
    color: '#707571',
  },
  timelineText: {
    fontSize: 13,
    color: '#1C1F1D',
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
