import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { 
  ChevronLeft, 
  Activity, 
  Dumbbell, 
  Users, 
  Briefcase, 
  Coffee, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Compass, 
  Moon, 
  Zap, 
  Award, 
  Clock, 
  CheckCircle,
  ShieldCheck
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const JUCOCH_GREEN = '#2D6A4F';

// Individual Activities (Personal Wellness & Daily Habits)
const INDIVIDUAL_ACTIVITIES = [
  { name: 'Workout & Fitness', icon: Dumbbell, desc: 'Gym, cardio, stretching' },
  { name: 'Mindful Meditation', icon: Sparkles, desc: 'Breathing, inner peace' },
  { name: 'Deep Work Focus', icon: Briefcase, desc: 'Career, productivity' },
  { name: 'Outdoor & Nature', icon: Compass, desc: 'Walking, fresh air' },
  { name: 'Book Reading', icon: BookOpen, desc: 'Personal growth, stories' },
  { name: 'Relaxation & Tea', icon: Coffee, desc: 'Unwinding, downtime' },
  { name: 'Friends & Family', icon: Users, desc: 'Quality social bonding' },
  { name: 'Creative Hobbies', icon: Activity, desc: 'Music, arts, journaling' },
];

// Student Activities (Academic, Campus & Study Life)
const STUDENT_ACTIVITIES = [
  { name: 'Class Lecture', icon: GraduationCap, desc: 'Attending lectures, notes' },
  { name: 'Study & Review', icon: BookOpen, desc: 'Textbooks, problem sets' },
  { name: 'Coursework / Project', icon: Briefcase, desc: 'Assignments, coding, labs' },
  { name: 'Exam & Quiz Prep', icon: Zap, desc: 'Intense cramming, mock test' },
  { name: 'Group Study Session', icon: Users, desc: 'Peer collaboration, team' },
  { name: 'Campus Commute', icon: Compass, desc: 'Walking to class, travel' },
  { name: 'Student Org / Club', icon: Award, desc: 'Extracurriculars, event' },
  { name: 'Campus Power Nap', icon: Moon, desc: 'Quick rest between classes' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function ActivityLoggerScreen() {
  const router = useRouter();
  const { userRole, addActivityEntry, isDarkMode, activityEntries } = useWellness();
  
  // Default to user's registered role category
  const defaultCategory = userRole === 'Student' ? 'Student' : 'Individual';
  const [activeCategory, setActiveCategory] = useState<'Individual' | 'Student'>(defaultCategory as any);
  
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [successMsg, setSuccessMsg] = useState('');

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#E2EFE7';

  const currentActivityList = activeCategory === 'Student' ? STUDENT_ACTIVITIES : INDIVIDUAL_ACTIVITIES;
  const themeColor = activeCategory === 'Student' ? '#1E88E5' : JUCOCH_GREEN;

  const toggleActivity = (name: string) => {
    if (selectedActivities.includes(name)) {
      setSelectedActivities(selectedActivities.filter(a => a !== name));
    } else {
      setSelectedActivities([...selectedActivities, name]);
    }
  };

  const handleSave = () => {
    if (selectedActivities.length === 0) return;
    
    selectedActivities.forEach(activity => {
      const categoryTag = activeCategory === 'Student' ? `[Student] ${activity}` : `[Individual] ${activity}`;
      addActivityEntry(categoryTag, selectedDuration);
    });

    setSuccessMsg(`Saved ${selectedActivities.length} activities (${selectedDuration} mins each)!`);
    setSelectedActivities([]);
    setTimeout(() => {
      setSuccessMsg('');
      router.back();
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}>
            <ChevronLeft size={22} color={dynamicText} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={[styles.title, { color: dynamicText }]}>Daily Activities</Text>
            <Text variant="bodySmall" style={[styles.subtitle, { color: dynamicSub }]}>
              Categorized for Individuals & Students
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: `${themeColor}18` }]}>
            <ShieldCheck size={14} color={themeColor} style={{ marginRight: 4 }} />
            <Text style={[styles.roleBadgeText, { color: themeColor }]}>{activeCategory}</Text>
          </View>
        </View>

        {/* Category Switcher: Individual vs Student */}
        <View style={styles.categorySwitcherRow}>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
              activeCategory === 'Individual' && { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN }
            ]}
            onPress={() => {
              setActiveCategory('Individual');
              setSelectedActivities([]);
            }}
            activeOpacity={0.8}
          >
            <Dumbbell size={16} color={activeCategory === 'Individual' ? '#FFF' : JUCOCH_GREEN} style={{ marginRight: 6 }} />
            <Text style={[styles.categoryBtnText, { color: dynamicText }, activeCategory === 'Individual' && { color: '#FFF' }]}>
              👤 Individual Wellness
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryBtn,
              { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
              activeCategory === 'Student' && { backgroundColor: '#1E88E5', borderColor: '#1E88E5' }
            ]}
            onPress={() => {
              setActiveCategory('Student');
              setSelectedActivities([]);
            }}
            activeOpacity={0.8}
          >
            <GraduationCap size={16} color={activeCategory === 'Student' ? '#FFF' : '#1E88E5'} style={{ marginRight: 6 }} />
            <Text style={[styles.categoryBtnText, { color: dynamicText }, activeCategory === 'Student' && { color: '#FFF' }]}>
              🎓 Student Campus
            </Text>
          </TouchableOpacity>
        </View>

        {/* Duration Selector */}
        <View style={styles.sectionHeaderRow}>
          <Clock size={14} color={themeColor} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionLabel, { color: dynamicSub }]}>SELECT DURATION PER ACTIVITY</Text>
        </View>

        <View style={styles.durationRow}>
          {DURATIONS.map((dur) => {
            const isDurSelected = selectedDuration === dur;
            return (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.durationChip,
                  { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                  isDurSelected && { backgroundColor: themeColor, borderColor: themeColor }
                ]}
                onPress={() => setSelectedDuration(dur)}
              >
                <Text style={[styles.durationChipText, { color: dynamicSub }, isDurSelected && { color: '#FFF', fontWeight: 'bold' }]}>
                  {dur}m
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Activity Selection Grid */}
        <View style={styles.sectionHeaderRow}>
          <Activity size={14} color={themeColor} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionLabel, { color: dynamicSub }]}>
            {activeCategory === 'Student' ? 'CAMPUS & STUDY ROUTINES' : 'PERSONAL WELLNESS HABITS'}
          </Text>
        </View>
        
        <View style={styles.activityGrid}>
          {currentActivityList.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedActivities.includes(item.name);
            return (
              <TouchableOpacity 
                key={item.name} 
                style={[
                  styles.activityCard,
                  { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                  isSelected && { backgroundColor: themeColor, borderColor: themeColor }
                ]}
                onPress={() => toggleActivity(item.name)}
                activeOpacity={0.8}
              >
                <Surface 
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${themeColor}18` },
                    isSelected && { backgroundColor: 'rgba(255,255,255,0.25)' }
                  ]} 
                  elevation={0}
                >
                  <Icon size={22} color={isSelected ? '#FFF' : themeColor} />
                </Surface>
                <Text style={[styles.activityName, { color: dynamicText }, isSelected && styles.selectedText]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.activityDesc, { color: dynamicSub }, isSelected && { color: 'rgba(255,255,255,0.85)' }]} numberOfLines={1}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Success Banner */}
        {!!successMsg && (
          <Surface style={styles.successCard} elevation={2}>
            <CheckCircle size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
            <Text style={styles.successText}>{successMsg}</Text>
          </Surface>
        )}

        {/* AI Insight Box */}
        <Surface style={[styles.aiNote, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
          <View style={[styles.insightIconBg, { backgroundColor: `${themeColor}18` }]}>
            <Sparkles size={16} color={themeColor} />
          </View>
          <Text style={[styles.noteText, { color: dynamicText }]}>
            {activeCategory === 'Student'
              ? 'AI Tip for Students: Logging study breaks & campus walks boosts cognitive focus during exam periods.'
              : 'AI Prediction: Regular physical activity & daily mindfulness improves sleep quality by up to 20%.'}
          </Text>
        </Surface>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSave}
          disabled={selectedActivities.length === 0}
          activeOpacity={0.85}
          style={styles.saveButtonWrapper}
        >
          <LinearGradient
            colors={selectedActivities.length > 0 ? [themeColor, '#1B4332'] : [isDarkMode ? '#243329' : '#D0E8D8', isDarkMode ? '#243329' : '#D0E8D8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.gradientButtonText, selectedActivities.length === 0 && { color: dynamicSub }]}>
              {selectedActivities.length > 0 
                ? `Save ${selectedActivities.length} ${activeCategory} Activity (${selectedActivities.length * selectedDuration}m total)`
                : 'Select Activities to Log'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    padding: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
    maxWidth: 550,
    alignSelf: 'center',
    width: '100%',
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  backButton: { 
    marginRight: 12, 
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  title: { fontWeight: 'bold' },
  subtitle: { marginTop: 2, fontSize: 12 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  categorySwitcherRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 2,
  },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    letterSpacing: 1.2 
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityCard: { 
    width: '48%', 
    borderRadius: 20, 
    padding: 16, 
    alignItems: 'center', 
    marginBottom: 12, 
    borderWidth: 1.5,
  },
  iconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  activityName: { fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  activityDesc: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  selectedText: { color: '#FFF' },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A3D9A5',
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  aiNote: { 
    flexDirection: 'row', 
    padding: 14, 
    borderRadius: 18, 
    marginBottom: 24, 
    alignItems: 'center',
    borderWidth: 1,
  },
  insightIconBg: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  noteText: { fontSize: 12, flex: 1, fontWeight: '500', lineHeight: 18 },
  saveButtonWrapper: { marginTop: 4, marginBottom: 20 },
  gradientButton: {
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  gradientButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
