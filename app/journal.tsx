import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
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
  const { addJournalEntry } = useWellness();
  const [entry, setEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleClearPrompt = () => {
    setSelectedPrompt(null);
  };

  const handleSave = () => {
    if (entry.trim()) {
      // If a prompt was active, prepend or attach it to the log meta if desired.
      // Here we combine them so it saves cleanly to your text field.
      const finalContent = selectedPrompt 
        ? `Prompt: ${selectedPrompt}\n\n${entry}`
        : entry;

      // addJournalEntry expects a string (the entry content) — pass the combined content
      addJournalEntry(finalContent);
      
      setEntry('');
      setSelectedPrompt(null);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* KeyboardAvoidingView alternative approach: using flexGrow on ScrollView so input stays accessible */}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text variant="headlineSmall" style={styles.title}>Daily Journal</Text>
            <Text variant="bodySmall" style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <Surface style={styles.aiTip} elevation={0}>
          <Sparkles size={18} color={JUCOCH_GREEN} />
          <Text style={styles.aiTipText}>
            Tip: Writing for just 5 minutes can help lower stress levels.
          </Text>
        </Surface>

        {/* Journal Prompts Horizontal Scroll */}
        <View style={styles.promptsSection}>
          <Text style={styles.promptsTitle}>Need inspiration?</Text>
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
                    isSelected && styles.selectedPromptButton
                  ]}
                  onPress={() => handlePromptSelect(prompt)}
                >
                  <Text style={[
                    styles.promptText,
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
          <View style={styles.activePromptContainer}>
            <View style={styles.activePromptHeader}>
              <Text style={styles.activePromptLabel}>WRITING PROMPT</Text>
              <TouchableOpacity onPress={handleClearPrompt}>
                <X size={16} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={styles.activePromptText}>{selectedPrompt}</Text>
          </View>
        )}

        {/* Input Wrapper */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={selectedPrompt ? "Write your response here..." : "How was your day? Write anything that's on your mind..."}
            value={entry}
            onChangeText={setEntry}
            multiline
            style={styles.journalInput}
            placeholderTextColor="#999"
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
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
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 24, paddingTop: 60, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16, backgroundColor: '#F5F5F5', padding: 8, borderRadius: 12 },
  title: { fontWeight: 'bold', color: '#1A1A1A' },
  dateText: { color: '#999', marginTop: 2 },
  aiTip: { flexDirection: 'row', backgroundColor: '#F0F5F2', padding: 14, borderRadius: 16, marginBottom: 24, alignItems: 'center' },
  aiTipText: { fontSize: 13, color: JUCOCH_GREEN, marginLeft: 10, flex: 1, fontWeight: '500' },

  promptsSection: { marginBottom: 24 },
  promptsTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  promptsScrollPadding: { paddingRight: 24 },
  promptButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  },
  selectedPromptButton: {
    backgroundColor: JUCOCH_GREEN,
    borderColor: JUCOCH_GREEN
  },
  promptText: { fontSize: 13, color: '#555' },
  selectedPromptText: { color: '#FFF', fontWeight: '600' },

  activePromptContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: JUCOCH_GREEN,
  },
  activePromptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  activePromptLabel: { fontSize: 10, fontWeight: 'bold', color: JUCOCH_GREEN, letterSpacing: 1 },
  activePromptText: { fontSize: 14, color: '#333', fontWeight: '500', lineHeight: 20 },

  inputContainer: { flex: 1, minHeight: 250 },
  journalInput: { flex: 1, fontSize: 16, color: '#333', lineHeight: 24, paddingTop: 0 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#FFF' },
  saveButton: { borderRadius: 16 },
});