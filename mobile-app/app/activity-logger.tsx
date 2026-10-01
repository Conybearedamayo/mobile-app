import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal } from 'react-native';
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
  ShieldCheck,
  Trash2,
  Edit3,
  X,
  AlertTriangle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness, ActivityEntry } from '@/context/WellnessContext';
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
  const { userRole, addActivityEntry, editActivityEntry, deleteActivityEntry, isDarkMode, activityEntries } = useWellness();
  
  // Strictly lock category to user's registered account role (Student vs Individual)
  const isStudent = userRole === 'Student';
  const activeCategory: 'Individual' | 'Student' = isStudent ? 'Student' : 'Individual';
  
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [successMsg, setSuccessMsg] = useState('');

  // Edit State
  const [editingActivity, setEditingActivity] = useState<ActivityEntry | null>(null);
  const [editDuration, setEditDuration] = useState<number>(30);

  // Delete State
  const [deletingActivityId, setDeletingActivityId] = useState<string | number | null>(null);

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#E2EFE7';

  const currentActivityList = isStudent ? STUDENT_ACTIVITIES : INDIVIDUAL_ACTIVITIES;
  const themeColor = isStudent ? '#1E88E5' : JUCOCH_GREEN;

  const formatEventDate = (timestamp?: string) => {
    if (!timestamp) return 'Today';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return timestamp;
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${weekday}, ${month} ${day} • ${time}`;
    } catch (e) {
      return 'Today';
    }
  };

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
      const categoryTag = isStudent ? `[Student] ${activity}` : `[Individual] ${activity}`;
      addActivityEntry(categoryTag, selectedDuration);
    });

    setSuccessMsg(`Saved ${selectedActivities.length} ${activeCategory} activities (${selectedDuration} mins each)!`);
    setSelectedActivities([]);
    setTimeout(() => {
      setSuccessMsg('');
      router.back();
    }, 1200);
  };

  const handleStartEdit = (entry: ActivityEntry) => {
    setEditingActivity(entry);
    setEditDuration(entry.duration || 30);
  };

  const handleSaveEdit = () => {
    if (!editingActivity) return;
    editActivityEntry(editingActivity.id, editingActivity.type, editDuration);
    setEditingActivity(null);
    setSuccessMsg('Activity duration updated successfully!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleConfirmDelete = () => {
    if (!deletingActivityId) return;
    deleteActivityEntry(deletingActivityId);
    setDeletingActivityId(null);
    setSuccessMsg('Activity entry deleted successfully.');
    setTimeout(() => setSuccessMsg(''), 2500);
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
              {isStudent ? '🎓 Student Campus & Academic Tracker' : '👤 Individual Personal Wellness Tracker'}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: `${themeColor}18` }]}>
            <ShieldCheck size={14} color={themeColor} style={{ marginRight: 4 }} />
            <Text style={[styles.roleBadgeText, { color: themeColor }]}>{activeCategory}</Text>
          </View>
        </View>

        {/* Role Exclusivity Banner */}
        <Surface style={[styles.roleBannerCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
          <View style={[styles.roleIconBg, { backgroundColor: `${themeColor}18` }]}>
            {isStudent ? <GraduationCap size={18} color="#1E88E5" /> : <Dumbbell size={18} color={JUCOCH_GREEN} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.roleBannerTitle, { color: dynamicText }]}>
              {isStudent ? 'Student Campus Activities' : 'Individual Wellness Habits'}
            </Text>
            <Text style={[styles.roleBannerSub, { color: dynamicSub }]}>
              {isStudent 
                ? 'Exclusively curated for study routines, lectures, orgs & exams.' 
                : 'Exclusively curated for personal fitness, mindfulness & work-life balance.'}
            </Text>
          </View>
        </Surface>

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
            {isStudent ? 'CAMPUS & STUDY ROUTINES' : 'PERSONAL WELLNESS HABITS'}
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
            {isStudent
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

        {/* Live Saved Activities Feed */}
        {activityEntries && activityEntries.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionHeaderRow}>
              <Clock size={14} color={themeColor} style={{ marginRight: 6 }} />
              <Text style={[styles.sectionLabel, { color: dynamicSub }]}>RECENTLY SAVED ACTIVITIES ({activityEntries.length})</Text>
            </View>

            {activityEntries.slice(0, 5).map((entry) => (
              <Surface key={entry.id} style={[styles.recentActivityItem, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <View style={[styles.recentIconBg, { backgroundColor: `${themeColor}18` }]}>
                  <Activity size={16} color={themeColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recentTitle, { color: dynamicText }]}>{entry.type.replace('[Individual] ', '').replace('[Student] ', '')}</Text>
                  <Text style={[styles.recentSub, { color: dynamicSub }]}>{formatEventDate(entry.timestamp)}</Text>
                </View>
                <View style={[styles.durationBadge, { backgroundColor: `${themeColor}20`, marginRight: 8 }]}>
                  <Text style={[styles.durationBadgeText, { color: themeColor }]}>{entry.duration} mins</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity 
                    onPress={() => handleStartEdit(entry)}
                    style={{ padding: 6, borderRadius: 8, backgroundColor: isDarkMode ? '#28332C' : '#F0F7F2' }}
                  >
                    <Edit3 size={15} color={themeColor} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setDeletingActivityId(entry.id)}
                    style={{ padding: 6, borderRadius: 8, backgroundColor: isDarkMode ? '#331F21' : '#FFE5E5' }}
                  >
                    <Trash2 size={15} color="#D90429" />
                  </TouchableOpacity>
                </View>
              </Surface>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Edit Activity Modal */}
      <Modal
        visible={!!editingActivity}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingActivity(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalCard, { backgroundColor: dynamicCardBg }]} elevation={4}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Edit3 size={18} color={themeColor} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: dynamicText }}>Edit Activity Duration</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingActivity(null)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: dynamicSub, marginBottom: 16 }}>
              Activity: <Text style={{ fontWeight: 'bold', color: dynamicText }}>{editingActivity?.type?.replace('[Individual] ', '').replace('[Student] ', '')}</Text>
            </Text>

            <Text style={[styles.sectionLabel, { color: dynamicSub, marginBottom: 10 }]}>SELECT NEW DURATION</Text>
            <View style={[styles.durationRow, { marginBottom: 20 }]}>
              {DURATIONS.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationChip,
                    { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                    editDuration === dur && { backgroundColor: themeColor, borderColor: themeColor }
                  ]}
                  onPress={() => setEditDuration(dur)}
                >
                  <Text style={[styles.durationChipText, { color: dynamicSub }, editDuration === dur && { color: '#FFF', fontWeight: 'bold' }]}>
                    {dur}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: dynamicBorder }]} onPress={() => setEditingActivity(null)}>
                <Text style={{ color: dynamicSub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: themeColor }]} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Delete Activity Modal */}
      <Modal
        visible={!!deletingActivityId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingActivityId(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.deleteModalCard, { backgroundColor: dynamicCardBg }]} elevation={4}>
            <View style={styles.deleteIconCircle}>
              <AlertTriangle size={24} color="#D90429" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: dynamicText, marginTop: 12, marginBottom: 6 }}>
              Delete Activity Entry?
            </Text>
            <Text style={{ fontSize: 13, color: dynamicSub, textAlign: 'center', marginBottom: 20 }}>
              This will permanently delete this activity record from your timeline and wellness stats.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { flex: 1, borderColor: dynamicBorder }]} 
                onPress={() => setDeletingActivityId(null)}
              >
                <Text style={{ color: dynamicSub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.deleteConfirmBtn, { flex: 1 }]} 
                onPress={handleConfirmDelete}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </Modal>
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
  roleBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  roleIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  roleBannerSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  recentActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  recentIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentSub: {
    fontSize: 10,
    marginTop: 2,
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmBtn: {
    backgroundColor: '#D90429',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
