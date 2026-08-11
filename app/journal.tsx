import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, Surface, TextInput } from 'react-native-paper';
import { ChevronLeft, Sparkles, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWellness } from '@/context/WellnessContext';

const JUCOCH_GREEN = '#2D6A4F';

const JOURNAL_PROMPTS = [
  "What made you smile today?",
  "List 3 things you are grateful for",
  "How did you handle stress today?",
  "What's one thing you learned today?",
  "Describe a moment you felt proud of yourself",
  "What are you looking forward to tomorrow?",
  "Write about a challenge you overcame",
  "How did you take care of yourself today?",
  "What made you feel energized today?",
  "Describe a kind act you witnessed or did"
];

export default function JournalScreen() {
  const router = useRouter();
  const { addJournalEntry, isDarkMode } = useWellness();
  const [entry, setEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const dynamicBg = isDarkMode ? '#121614' : '#FFF';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#F8F9FA';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1A1A1A';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#999';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#EEE';

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleClearPrompt = () => {
    setSelectedPrompt(null);
  };

  const handleSave = () => {
    if (entry.trim()) {
      const finalContent = selectedPrompt 
        ? `Prompt: ${selectedPrompt}\n\n${entry}`
        : entry;

      addJournalEntry(finalContent);
      
      setEntry('');
      setSelectedPrompt(null);
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: dynamicBg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: dynamicCardBg }]}>
            <ChevronLeft size={24} color={dynamicText} />
          </TouchableOpacity>
          <View>
            <Text variant="headlineSmall" style={[styles.title, { color: dynamicText }]}>Daily Journal</Text>
            <Text variant="bodySmall" style={[styles.dateText, { color: dynamicSub }]}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <Surface style={[styles.aiTip, { backgroundColor: isDarkMode ? '#1E3A2B' : '#F0F5F2' }]} elevation={0}>
          <Sparkles size={18} color={JUCOCH_GREEN} />
          <Text style={styles.aiTipText}>
            Tip: Writing for just 5 minutes can help lower stress levels.
          </Text>
        </Surface>

        {/* Journal Prompts Horizontal Scroll */}
        <View style={styles.promptsSection}>
          <Text style={[styles.promptsTitle, { color: dynamicText }]}>Need inspiration?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptsScrollPadding}
          >
            {JOURNAL_PROMPTS.map((prompt, index) => {
              const isSelected = selectedPrompt === prompt;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.promptButton,
                    { backgroundColor: dynamicCardBg, borderColor: dynamicBorder },
                    isSelected && styles.selectedPromptButton
                  ]}
                  onPress={() => handlePromptSelect(prompt)}
                >
                  <Text style={[
                    styles.promptText,
                    { color: dynamicSub },
                    isSelected && styles.selectedPromptText
                  ]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Dynamic Context Header for Selected Prompt */}
        {selectedPrompt && (
          <View style={[styles.activePromptContainer, { backgroundColor: dynamicCardBg }]}>
            <View style={styles.activePromptHeader}>
              <Text style={styles.activePromptLabel}>WRITING PROMPT</Text>
              <TouchableOpacity onPress={handleClearPrompt}>
                <X size={16} color={dynamicSub} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.activePromptText, { color: dynamicText }]}>{selectedPrompt}</Text>
          </View>
        )}

        {/* Input Wrapper */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={selectedPrompt ? "Write your response here..." : "How was your day? Write anything that's on your mind..."}
            value={entry}
            onChangeText={setEntry}
            mode="flat"
            multiline
            textColor={isDarkMode ? '#FFFFFF' : '#1A1A1A'}
            theme={{ colors: { onSurface: isDarkMode ? '#FFFFFF' : '#1A1A1A', text: isDarkMode ? '#FFFFFF' : '#1A1A1A', primary: JUCOCH_GREEN } }}
            style={[styles.journalInput, { backgroundColor: dynamicBg, color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            placeholderTextColor={isDarkMode ? '#9EB3A5' : '#999999'}
            selectionColor={JUCOCH_GREEN}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: dynamicBg, borderTopColor: dynamicBorder }]}>
        <Button
          mode="contained"
          buttonColor={JUCOCH_GREEN}
          style={styles.saveButton}
          contentStyle={{ height: 50 }}
          onPress={handleSave}
          disabled={!entry.trim()}
        >
          Finish & Analyze with AI
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16, padding: 8, borderRadius: 12 },
  title: { fontWeight: 'bold' },
  dateText: { marginTop: 2 },
  aiTip: { flexDirection: 'row', padding: 14, borderRadius: 16, marginBottom: 24, alignItems: 'center' },
  aiTipText: { fontSize: 13, color: JUCOCH_GREEN, marginLeft: 10, flex: 1, fontWeight: '500' },

  promptsSection: { marginBottom: 24 },
  promptsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  promptsScrollPadding: { paddingRight: 24 },
  promptButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  selectedPromptButton: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN
  },
  promptText: { fontSize: 13 },
  selectedPromptText: { color: '#FFF', fontWeight: '600' },

  activePromptContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: JUCOCH_GREEN,
  },
  activePromptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  activePromptLabel: { fontSize: 10, fontWeight: 'bold', color: JUCOCH_GREEN, letterSpacing: 1 },
  activePromptText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },

  inputContainer: { flex: 1, minHeight: 250 },
  journalInput: { flex: 1, fontSize: 16, lineHeight: 24, paddingTop: 0 },
  footer: { padding: 24, borderTopWidth: 1 },
  saveButton: { borderRadius: 16 },
});