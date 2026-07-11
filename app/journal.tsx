import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { ChevronLeft, Book, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const JUCOCH_GREEN = '#2D6A4F';

export default function JournalScreen() {
  const router = useRouter();
  const [entry, setEntry] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text variant="headlineSmall" style={styles.title}>Daily Journal</Text>
            <Text variant="bodySmall" style={styles.dateText}>March 11, 2026</Text>
          </View>
        </View>

        <Surface style={styles.aiTip} elevation={1}>
          <Sparkles size={20} color={JUCOCH_GREEN} />
          <Text style={styles.aiTipText}>
            Tip: Writing for just 5 minutes can help lower stress levels.
          </Text>
        </Surface>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="How was your day? Write anything that's on your mind..."
            value={entry}
            onChangeText={setEntry}
            multiline
            style={styles.journalInput}
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          mode="contained" 
          buttonColor={JUCOCH_GREEN} 
          style={styles.saveButton}
          onPress={() => router.back()}
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
  dateText: { color: '#999' },
  aiTip: { flexDirection: 'row', backgroundColor: '#F0F5F2', padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'center' },
  aiTipText: { fontSize: 12, color: JUCOCH_GREEN, marginLeft: 12, flex: 1, fontWeight: '500' },
  inputContainer: { flex: 1 },
  journalInput: { fontSize: 16, color: '#333', lineHeight: 24, textAlignVertical: 'top', minHeight: 300 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#EEE' },
  saveButton: { borderRadius: 16, paddingVertical: 6 },
});
