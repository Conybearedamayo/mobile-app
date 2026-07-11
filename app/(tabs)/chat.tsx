import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, Avatar, IconButton, Surface } from 'react-native-paper';
import { Send, Plus, MoreVertical, Smile } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';
const AI_BUBBLE_COLOR = '#F0F5F2';
const USER_BUBBLE_COLOR = JUCOCH_GREEN;

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Good morning! I've reviewed your past week. Your mood average improved to 7.2. I noticed some sleep disruption though. How are you feeling today?", sender: 'ai', time: '9:02 AM' },
    { id: 2, text: "I'm feeling better but still have trouble sleeping. My mind keeps racing.", sender: 'user', time: '9:04 AM' },
    { id: 3, text: "That's 'cognitive hyperarousal'. Based on your patterns, this often happens after high-stress days. Would you like a guided relaxation session?", sender: 'ai', time: '9:05 AM' },
  ]);

  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    
    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
            <View style={styles.aiInfoRow}>
                <Avatar.Text size={40} label="AI" style={{ backgroundColor: JUCOCH_GREEN }} />
                <View style={styles.headerTextContainer}>
                    <Text variant="titleMedium" style={styles.aiName}>Jucoch AI</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text variant="bodySmall" style={styles.statusText}>Analyzing patterns...</Text>
                    </View>
                </View>
            </View>
            <IconButton icon="dots-vertical" size={24} onPress={() => {}} />
        </View>
      </Surface>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.sender === 'user' ? styles.userWrapper : styles.aiWrapper]}>
            <Surface style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]} elevation={1}>
              <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.aiText]}>
                {msg.text}
              </Text>
            </Surface>
            <Text style={styles.timeText}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputSection}>
        <Surface style={styles.inputContainer} elevation={1}>
            <TouchableOpacity style={styles.iconButton}>
                <Plus size={22} color="#666" />
            </TouchableOpacity>
            <TextInput
                placeholder="Share your thoughts..."
                value={inputText}
                onChangeText={setInputText}
                style={styles.textInput}
                multiline
                placeholderTextColor="#999"
            />
            <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && styles.disabledSend]} 
                onPress={sendMessage}
                disabled={!inputText.trim()}
            >
                <Send size={18} color="#FFF" />
            </TouchableOpacity>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  aiName: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#48BB78',
    marginRight: 6,
  },
  statusText: {
    color: '#999',
    fontSize: 11,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 30,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: JUCOCH_GREEN,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#333',
  },
  userText: {
    color: '#FFF',
  },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 4,
    alignSelf: 'flex-end',
  },
  inputSection: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  iconButton: {
    padding: 10,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 8,
  },
  sendButton: {
    backgroundColor: JUCOCH_GREEN,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  disabledSend: {
    backgroundColor: '#CCC',
  },
});
