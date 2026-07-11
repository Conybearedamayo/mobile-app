import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Badge, Avatar, Divider } from 'react-native-paper';
import { TrendingUp, AlertCircle, Clock, Activity, Zap, Moon } from 'lucide-react-native';

const JUCOCH_GREEN = '#2D6A4F';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>AI Insights</Text>
        <Text variant="bodySmall" style={styles.subtitle}>Behavioral analysis - Last 30 days</Text>
      </View>

      {/* Risk Score Card */}
      <Card style={styles.riskCard}>
        <Card.Content style={styles.riskContent}>
          <View style={styles.riskHeader}>
            <Text style={styles.riskTitle}>MENTAL HEALTH RISK SCORE</Text>
          </View>
          <View style={styles.riskValueRow}>
            <Text style={styles.riskValue}>62</Text>
            <View style={styles.riskTextWrapper}>
              <Text style={styles.riskLevel}>Moderate Risk</Text>
              <Text style={styles.riskDetail}>Continuous AI monitoring active. No crisis indicators detected.</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Event Timeline */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={18} color={JUCOCH_GREEN} />
          <Text style={styles.sectionTitle}>AI Event Timeline</Text>
        </View>
        
        <TimelineItem 
          date="Today - 9:04 AM"
          title="Mood improving. Breathing exercises 3 days in a row — positive impact confirmed."
          tags={['Self-Care', 'Progress']}
        />
        <TimelineItem 
          date="Yesterday - 11:45 PM"
          title="Sleep below 6 hrs for 4th consecutive night. Stress-related insomnia detected."
          tags={['Sleep', 'Stress']}
          isWarning
        />
        <TimelineItem 
          date="March 9 - 3:12 PM"
          title="Early warning: 3 consecutive bad mood logs + low activity. Check-in recommended."
          tags={['Early Warning']}
          isWarning
        />
      </View>

      {/* Behavioral Correlators */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={18} color={JUCOCH_GREEN} />
          <Text style={styles.sectionTitle}>Behavioral Correlators</Text>
        </View>
        
        <View style={styles.correlatorGrid}>
          <CorrelatorItem 
            icon={Moon} 
            title="Sleep → Mood" 
            desc="+0.8 mood per extra sleep hour" 
            percentage="+87%" 
          />
          <CorrelatorItem 
            icon={Activity} 
            title="Exercise → Next Day Mood" 
            desc="Consistent morning energy boost" 
            percentage="+24%" 
          />
        </View>
      </View>
    </ScrollView>
  );
}

function TimelineItem({ date, title, tags, isWarning }: any) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLine} />
      <View style={[styles.timelineDot, isWarning && styles.warningDot]} />
      <View style={styles.timelineContent}>
        <Text style={styles.timelineDate}>{date}</Text>
        <Text style={styles.timelineTitle}>{title}</Text>
        <View style={styles.tagRow}>
          {tags.map((tag: string) => (
            <Badge key={tag} style={styles.timelineBadge}>{tag}</Badge>
          ))}
        </View>
      </View>
    </View>
  );
}

function CorrelatorItem({ icon: Icon, title, desc, percentage }: any) {
  return (
    <Card style={styles.correlatorCard}>
      <Card.Content>
        <View style={styles.correlatorHeader}>
          <Icon size={16} color={JUCOCH_GREEN} />
          <Text style={styles.correlatorPercentage}>{percentage}</Text>
        </View>
        <Text style={styles.correlatorTitle}>{title}</Text>
        <Text style={styles.correlatorDesc}>{desc}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
  },
  riskCard: {
    backgroundColor: JUCOCH_GREEN,
    borderRadius: 16,
    marginBottom: 32,
  },
  riskContent: {
    padding: 16,
  },
  riskHeader: {
    marginBottom: 12,
  },
  riskTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  riskValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskValue: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: 16,
  },
  riskTextWrapper: {
    flex: 1,
  },
  riskLevel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riskDetail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    lineHeight: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingLeft: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 20,
    bottom: -24,
    width: 2,
    backgroundColor: '#EEE',
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: JUCOCH_GREEN,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 1,
  },
  warningDot: {
    backgroundColor: '#FF6B6B',
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
  },
  timelineBadge: {
    backgroundColor: '#F0F5F2',
    color: JUCOCH_GREEN,
    fontSize: 9,
    marginRight: 6,
  },
  correlatorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  correlatorCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#F9F9F9',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  correlatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  correlatorPercentage: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: 'bold',
  },
  correlatorTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  correlatorDesc: {
    fontSize: 9,
    color: '#666',
  },
});
