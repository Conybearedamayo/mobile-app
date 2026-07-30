import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, Avatar, Surface } from 'react-native-paper';
import { Send, Plus, Sparkles, MessageCircle } from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { userAlias } = useWellness();

  // Clean initial state: Jucoch AI Welcome Greeting
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello ${userAlias || 'there'}! I am Jucoch AI, your anonymous mental health companion. How are you feeling today?`, 
      sender: 'ai', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getAIResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    if (text.includes('stress') || text.includes('stressful') || text.includes('pressure') || text.includes('stressed')) {
      return "I understand you're feeling stressed. When pressure builds up, try taking 3 deep breaths (inhale for 4s, hold for 4s, exhale for 4s). It stimulates the vagus nerve to calm your body. Let's do it together?";
    }
    if (text.includes('sleep') || text.includes('insomnia') || text.includes('tired') || text.includes('sleeping')) {
      return "Sleep disruptions often correlate with high cognitive activity before bed. Try avoiding screen time 30 mins before sleeping, or try a 5-minute progressive muscle relaxation. Should I guide you through it?";
    }
    if (text.includes('sad') || text.includes('down') || text.includes('depressed') || text.includes('lonely') || text.includes('hurt')) {
      return "I'm really sorry to hear you're feeling down. Remember that it's completely okay to feel this way. You don't have to carry it all alone. Writing down your specific thoughts in your Journal can help release some weight.";
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('hello ai')) {
      return `Hello! I am Jucoch AI, your mental health companion. I'm here to listen, track your wellness patterns, and give relaxation exercises. How can I help you today, ${userAlias || 'friend'}?`;
    }
    if (text.includes('good') || text.includes('happy') || text.includes('great') || text.includes('amazing')) {
      return "That's wonderful to hear! Capitalizing on positive moments is just as important. What made today feel so good? Recording this can anchor the feeling!";
    }
    return "Thank you for sharing that with me. I'm analyzing this entry for emotional triggers. Remember, baby steps matter. What is one small thing you can do for yourself in the next 5 minutes?";
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;
    
    const userMsg = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const query = inputText;
    setInputText('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Trigger typing state
    setIsTyping(true);
    
    // Simulate AI response after 1.2 seconds
    setTimeout(() => {
      setIsTyping(false);
      const aiResponseText = getAIResponse(query);
      const aiMsg = {
        id: updatedMessages.length + 1,
        text: aiResponseText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1200);
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
            <View style={styles.avatarOutline}>
              <Avatar.Text size={40} label="AI" style={{ backgroundColor: JUCOCH_GREEN }} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text variant="titleMedium" style={styles.aiName}>Jucoch AI</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text variant="bodySmall" style={styles.statusText}>
                  {isTyping ? 'Analyzing thoughts...' : 'Online & Listening'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.sparkleIconWrapper}>
            <Sparkles size={18} color={JUCOCH_GREEN} />
          </View>
        </View>
      </Surface>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.sender === 'user' ? styles.userWrapper : styles.aiWrapper]}>
            {msg.sender === 'user' ? (
              <LinearGradient
                colors={[JUCOCH_GREEN, '#1B4332']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bubble, styles.userBubble]}
              >
                <Text style={[styles.messageText, styles.userText]}>
                  {msg.text}
                </Text>
              </LinearGradient>
            ) : (
              <Surface style={[styles.bubble, styles.aiBubble]} elevation={1}>
                <Text style={[styles.messageText, styles.aiText]}>
                  {msg.text}
                </Text>
              </Surface>
            )}
            <Text style={styles.timeText}>{msg.time}</Text>
          </View>
        ))}

        {/* Loading typing bubble */}
        {isTyping && (
          <View style={[styles.messageWrapper, styles.aiWrapper]}>
            <Surface style={[styles.bubble, styles.aiBubble, styles.typingBubble]} elevation={1}>
              <Text style={styles.typingText}>Jucoch AI is typing...</Text>
            </Surface>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputSection}>
        <Surface style={styles.inputContainer} elevation={1}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Plus size={20} color="#707571" />
          </TouchableOpacity>
          <TextInput
            placeholder="Share your thoughts..."
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            multiline
            placeholderTextColor="#909591"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.disabledSend]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            {inputText.trim() ? (
              <LinearGradient
                colors={[JUCOCH_GREEN, '#1B4332']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendButtonGradient}
              >
                <Send size={16} color="#FFF" />
              </LinearGradient>
            ) : (
              <View style={styles.sendButtonPlaceholder}>
                <Send size={16} color="#B0B5B1" />
              </View>
            )}
          </TouchableOpacity>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderWidth: 1,
    borderColor: '#EBF2EE',
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
  avatarOutline: {
    borderRadius: 22,
    padding: 2,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D8F3DC',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  aiName: {
    fontWeight: 'bold',
    color: '#1C1F1D',
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
    color: '#707571',
    fontSize: 11,
    fontWeight: '500',
  },
  sparkleIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 110,
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
    borderRadius: 22,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EBF2EE',
  },
  userBubble: {
    borderTopRightRadius: 4,
    elevation: 4,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  typingBubble: {
    backgroundColor: '#FFF',
    borderStyle: 'dashed',
    borderColor: JUCOCH_GREEN,
  },
  typingText: {
    fontSize: 13,
    color: JUCOCH_GREEN,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#333A36',
  },
  userText: {
    color: '#FFF',
  },
  timeText: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 4,
    marginHorizontal: 8,
    alignSelf: 'flex-end',
  },
  inputSection: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#EBF2EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 15,
    color: '#1C1F1D',
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  sendButtonPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F8F5',
  },
  disabledSend: {
    opacity: 0.8,
  },
});
