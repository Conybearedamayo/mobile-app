import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ChevronLeft, Moon, Star, Trash2, Edit3, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { useWellness, SleepEntry } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const JUCOCH_GREEN = '#2D6A4F';

const SLEEP_QUALITIES = [
  { label: 'Restless', icon: '😫', color: '#FF6B6B' },
  { label: 'Poor', icon: '🙁', color: '#FF9F43' },
  { label: 'Good', icon: '🙂', color: '#FBC531' },
  { label: 'Excellent', icon: '😴', color: '#48BB78' }
];

export default function SleepLoggerScreen() {
  const router = useRouter();
  const { addSleepLog, editSleepLog, deleteSleepLog, sleepLogs, isDarkMode } = useWellness();
  const [hours, setHours] = useState('7');
  const [quality, setQuality] = useState('Good');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit State
  const [editingSleep, setEditingSleep] = useState<SleepEntry | null>(null);
  const [editHours, setEditHours] = useState<string>('7');
  const [editQuality, setEditQuality] = useState<string>('Good');

  // Delete State
  const [deletingSleepId, setDeletingSleepId] = useState<string | number | null>(null);

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';

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

  const handleSave = () => {
    const numericHours = parseInt(hours.replace('+', ''), 10) || 7;
    addSleepLog(numericHours, quality);
    setSuccessMsg(`Recorded ${numericHours} hours of ${quality} sleep!`);
    setTimeout(() => {
      setSuccessMsg('');
      router.back();
    }, 1000);
  };

  const handleStartEdit = (entry: SleepEntry) => {
    setEditingSleep(entry);
    setEditHours(String(entry.hours));
    setEditQuality(entry.quality);
  };

  const handleSaveEdit = () => {
    if (!editingSleep) return;
    const numericHours = parseFloat(editHours) || 7;
    editSleepLog(editingSleep.id, numericHours, editQuality);
    setEditingSleep(null);
    setSuccessMsg('Sleep record updated successfully!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleConfirmDelete = () => {
    if (!deletingSleepId) return;
    deleteSleepLog(deletingSleepId);
    setDeletingSleepId(null);
    setSuccessMsg('Sleep record deleted successfully.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}>
            <ChevronLeft size={24} color={dynamicText} />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={[styles.title, { color: dynamicText }]}>Sleep Patterns</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: dynamicSub }]}>HOW MANY HOURS DID YOU SLEEP?</Text>
          <View style={styles.hoursRow}>
            {['4', '5', '6', '7', '8', '9+'].map(h => {
              const isSelected = hours === h;
              return (
                <TouchableOpacity 
                  key={h} 
                  style={[
                    styles.hourCard, 
                    { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                    isSelected && styles.selectedHourCard
                  ]}
                  onPress={() => setHours(h)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.hourText, { color: dynamicText }, isSelected && styles.selectedHourText]}>{h}</Text>
                  <Text style={[styles.hourUnit, { color: dynamicSub }, isSelected && styles.selectedHourText]}>hrs</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: dynamicSub }]}>SLEEP QUALITY</Text>
          <View style={styles.qualityGrid}>
            {[
              { label: 'Restless', icon: '😫', color: '#FF6B6B' },
              { label: 'Poor', icon: '🙁', color: '#FF9F43' },
              { label: 'Good', icon: '🙂', color: '#FBC531' },
              { label: 'Excellent', icon: '😴', color: '#48BB78' }
            ].map(q => {
              const isSelected = quality === q.label;
              return (
                <TouchableOpacity
                  key={q.label}
                  style={[
                    styles.qualityCard,
                    { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                    isSelected && { borderColor: q.color, borderWidth: 2, backgroundColor: `${q.color}18` }
                  ]}
                  onPress={() => setQuality(q.label)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.qualityEmoji}>{q.icon}</Text>
                  <Text style={[styles.qualityLabel, { color: dynamicSub }, isSelected && { color: q.color, fontWeight: 'bold' }]}>{q.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveBtnWrapper}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[JUCOCH_GREEN, '#1B4332']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <Text style={styles.saveBtnText}>Save Sleep Record</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Success Banner */}
        {!!successMsg && (
          <Surface style={styles.successCard} elevation={2}>
            <CheckCircle size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
            <Text style={styles.successText}>{successMsg}</Text>
          </Surface>
        )}

        {/* Recently Logged Sleep */}
        {sleepLogs && sleepLogs.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <View style={styles.sectionHeaderRow}>
              <Clock size={14} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
              <Text style={[styles.sectionLabel, { color: dynamicSub }]}>RECENT SLEEP RECORDS ({sleepLogs.length})</Text>
            </View>

            {sleepLogs.slice(0, 5).map((entry) => (
              <Surface key={entry.id} style={[styles.recentSleepItem, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <View style={[styles.recentSleepIconBg, { backgroundColor: isDarkMode ? '#231E38' : '#EDE7F6' }]}>
                  <Moon size={18} color="#5F27CD" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.recentSleepTitle, { color: dynamicText }]}>
                    {entry.hours} Hours • {entry.quality}
                  </Text>
                  <Text style={[styles.recentSleepDate, { color: dynamicSub }]}>{formatEventDate(entry.timestamp)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity 
                    onPress={() => handleStartEdit(entry)}
                    style={{ padding: 6, borderRadius: 8, backgroundColor: isDarkMode ? '#28332C' : '#F0F7F2' }}
                  >
                    <Edit3 size={15} color={JUCOCH_GREEN} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setDeletingSleepId(entry.id)}
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

      {/* Edit Sleep Modal */}
      <Modal
        visible={!!editingSleep}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingSleep(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.editModalCard, { backgroundColor: dynamicCardBg }]} elevation={4}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Edit3 size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: dynamicText }}>Edit Sleep Record</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingSleep(null)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: dynamicSub, marginBottom: 10 }]}>SELECT HOURS</Text>
            <View style={[styles.hoursRow, { marginBottom: 16 }]}>
              {['4', '5', '6', '7', '8', '9+'].map((h) => {
                const isSelected = editHours === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.hourCard,
                      { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                      isSelected && styles.selectedHourCard
                    ]}
                    onPress={() => setEditHours(h)}
                  >
                    <Text style={[styles.hourText, { color: dynamicText }, isSelected && styles.selectedHourText]}>{h}</Text>
                    <Text style={[styles.hourUnit, { color: dynamicSub }, isSelected && styles.selectedHourText]}>hrs</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: dynamicSub, marginBottom: 10 }]}>SLEEP QUALITY</Text>
            <View style={[styles.qualityGrid, { marginBottom: 20 }]}>
              {SLEEP_QUALITIES.map((q) => {
                const isSelected = editQuality === q.label;
                return (
                  <TouchableOpacity
                    key={q.label}
                    style={[
                      styles.qualityCard,
                      { backgroundColor: dynamicCardBg, borderColor: dynamicBorder, paddingVertical: 10 },
                      isSelected && { borderColor: q.color, borderWidth: 2, backgroundColor: `${q.color}18` }
                    ]}
                    onPress={() => setEditQuality(q.label)}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 2 }}>{q.icon}</Text>
                    <Text style={[styles.qualityLabel, { color: dynamicSub }, isSelected && { color: q.color, fontWeight: 'bold' }]}>{q.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: dynamicBorder }]} onPress={() => setEditingSleep(null)}>
                <Text style={{ color: dynamicSub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: JUCOCH_GREEN }]} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </Modal>

      {/* Delete Sleep Modal */}
      <Modal
        visible={!!deletingSleepId}
        transparent
        animationType="fade"
        onRequestClose={() => setDeletingSleepId(null)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.deleteModalCard, { backgroundColor: dynamicCardBg }]} elevation={4}>
            <View style={styles.deleteIconCircle}>
              <AlertTriangle size={24} color="#D90429" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: dynamicText, marginTop: 12, marginBottom: 6 }}>
              Delete Sleep Record?
            </Text>
            <Text style={{ fontSize: 13, color: dynamicSub, textAlign: 'center', marginBottom: 20 }}>
              This will permanently delete this sleep entry from your timeline and sleep pattern graphs.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.modalCancelBtn, { flex: 1, borderColor: dynamicBorder }]} 
                onPress={() => setDeletingSleepId(null)}
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
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backButton: { marginRight: 16, width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  title: { fontWeight: 'bold' },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 16 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hourCard: { width: '15%', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1.5 },
  selectedHourCard: { backgroundColor: JUCOCH_GREEN, borderColor: JUCOCH_GREEN },
  hourText: { fontSize: 16, fontWeight: 'bold' },
  hourUnit: { fontSize: 10, marginTop: 2 },
  selectedHourText: { color: '#FFF' },
  qualityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  qualityCard: { width: '48%', paddingVertical: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1.5 },
  qualityEmoji: { fontSize: 32, marginBottom: 6 },
  qualityLabel: { fontSize: 13, fontWeight: '600' },
  saveBtnWrapper: { marginTop: 12 },
  saveBtnGradient: { height: 56, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#A3D9A5',
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentSleepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  recentSleepIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentSleepTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentSleepDate: {
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFooterRow: {
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
