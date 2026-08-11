import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Surface, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { BookOpen, Sparkles, ShieldCheck, CheckCircle, ArrowLeft, Trash2, Calendar } from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

const PROMPTS = [
  "What made you smile today? 😊",
  "What is one challenge you overcame? 💪",
  "What are 3 things you are grateful for? ✨",
  "What is a peaceful thought you had today? 🌿",
];

export default function JournalLoggerScreen() {
  const router = useRouter();
  const { journalEntries, addJournalEntry, isDarkMode } = useWellness();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#E2EFE7';

  const handleSelectPrompt = (promptText: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${promptText} ` : `${promptText} `));
  };

  const handleSaveJournal = () => {
    if (!content.trim()) return;
    setLoading(true);
    setTimeout(() => {
      addJournalEntry(content.trim());
      setLoading(false);
      setSuccessMsg('Your journal reflection has been saved securely!');
      setContent('');
      setTimeout(() => setSuccessMsg(''), 2500);
    }, 600);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: dynamicBg }]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}>
            <ArrowLeft size={20} color={dynamicText} />
          </TouchableOpacity>

          <View style={styles.headerTextWrapper}>
            <Text variant="headlineSmall" style={[styles.title, { color: dynamicText }]}>Gratitude Journal</Text>
            <Text variant="bodySmall" style={[styles.subtitle, { color: dynamicSub }]}>Reflect & release your daily thoughts</Text>
          </View>

          <View style={styles.privacyBadge}>
            <ShieldCheck size={14} color={JUCOCH_GREEN} />
            <Text style={styles.privacyText}>Encrypted</Text>
          </View>
        </View>

        {/* Reflection Prompts Bar */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>TAP A PROMPT TO START WRITING</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroll}>
            {PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.promptChip, { backgroundColor: dynamicCardBg, borderColor: isDarkMode ? '#2C3A31' : '#D8F3DC' }]}
                onPress={() => handleSelectPrompt(prompt)}
                activeOpacity={0.75}
              >
                <Sparkles size={14} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
                <Text style={[styles.promptChipText, { color: dynamicText }]}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Rich Input Card */}
        <Surface style={[styles.inputCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
          <View style={styles.cardHeader}>
            <BookOpen size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>DAILY REFLECTION</Text>
          </View>

          <TextInput
            placeholder="Write freely... How was your day? What brought you peace or stress?"
            value={content}
            onChangeText={setContent}
            mode="flat"
            multiline
            numberOfLines={6}
            textColor={isDarkMode ? '#FFFFFF' : '#1C1F1D'}
            theme={{ colors: { onSurface: isDarkMode ? '#FFFFFF' : '#1C1F1D', text: isDarkMode ? '#FFFFFF' : '#1C1F1D' } }}
            style={[styles.journalInput, { backgroundColor: dynamicCardBg, color: isDarkMode ? '#FFFFFF' : '#1C1F1D' }]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            placeholderTextColor={dynamicSub}
          />

          <View style={[styles.cardFooter, { borderTopColor: dynamicBorder }]}>
            <Text style={[styles.wordCount, { color: dynamicSub }]}>{content.trim().split(/\s+/).filter(Boolean).length} words</Text>
            <TouchableOpacity 
              onPress={handleSaveJournal}
              disabled={!content.trim() || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={content.trim() ? [JUCOCH_GREEN, '#1B4332'] : [isDarkMode ? '#28332C' : '#EBF2EE', isDarkMode ? '#28332C' : '#EBF2EE']}
                style={styles.saveButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={[styles.saveBtnText, !content.trim() && styles.disabledBtnText]}>
                    Save Reflection
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Surface>

        {!!successMsg && (
          <View style={styles.successBox}>
            <CheckCircle size={18} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        {/* Past Journal Entries Feed */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>MY PAST REFLECTIONS ({journalEntries.length})</Text>

          {journalEntries.length === 0 ? (
            <Surface style={[styles.emptyCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
              <BookOpen size={32} color={dynamicSub} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyTitle, { color: dynamicText }]}>No Entries Logged Yet</Text>
              <Text style={[styles.emptySub, { color: dynamicSub }]}>Your saved gratitude entries will appear here in chronological order.</Text>
            </Surface>
          ) : (
            journalEntries.map((entry: any, index: number) => (
              <Surface key={entry.id || index} style={[styles.entryCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <View style={styles.entryHeader}>
                  <View style={styles.dateRow}>
                    <Calendar size={14} color={JUCOCH_GREEN} style={{ marginRight: 6 }} />
                    <Text style={[styles.entryDate, { color: dynamicSub }]}>{entry.timestamp || 'Today'}</Text>
                  </View>
                  <Surface style={styles.encryptedTag} elevation={0}>
                    <Text style={styles.encryptedTagText}>Encrypted</Text>
                  </Surface>
                </View>
                <Text style={[styles.entryContent, { color: dynamicText }]}>{entry.content}</Text>
              </Surface>
            ))
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginBottom: 20,
  },
  backButton: {
    borderRadius: 14,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginRight: 12,
  },
  headerTextWrapper: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#808983',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  promptScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputCard: {
    borderRadius: 26,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
    letterSpacing: 1,
  },
  journalInput: {
    fontSize: 15,
    minHeight: 140,
    paddingHorizontal: 0,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  wordCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveButtonGradient: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  disabledBtnText: {
    color: '#A0A5A1',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#A3D9A5',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  successText: {
    color: JUCOCH_GREEN,
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  emptyCard: {
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  entryCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  encryptedTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  encryptedTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});
