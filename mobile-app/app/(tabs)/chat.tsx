import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions, 
  Alert 
} from 'react-native';
import { Text, Avatar, Surface, Portal, Modal, Divider } from 'react-native-paper';
import { 
  Send, 
  Plus, 
  Sparkles, 
  MessageCircle, 
  RotateCcw, 
  Trash2, 
  History, 
  Clock, 
  X, 
  ChevronRight,
  MessageSquare,
  Bot
} from 'lucide-react-native';
import { useWellness } from '@/context/WellnessContext';
import { LinearGradient } from 'expo-linear-gradient';
import { sendAiChatApi } from '@/src/services/wellnessService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const JUCOCH_GREEN = '#2D6A4F';

interface Message {
  id: string | number;
  text: string;
  sender: 'user' | 'ai';
  time: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { userAlias, isDarkMode, userAvatar } = useWellness();

  const dynamicBg = isDarkMode ? '#121614' : '#F3F8F5';
  const dynamicCardBg = isDarkMode ? '#1C231F' : '#FFFFFF';
  const dynamicText = isDarkMode ? '#EAF2EC' : '#1C1F1D';
  const dynamicSub = isDarkMode ? '#9EB3A5' : '#707571';
  const dynamicBorder = isDarkMode ? '#2C3A31' : '#EBF2EE';

  const makeInitialGreeting = (): Message[] => [
    {
      id: `ai-intro-${Date.now()}`,
      text: `Hello ${userAlias || 'there'}! I am Jucoch AI, your anonymous mental health companion. How are you feeling today?`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const storageKey = `@jucoch_ai_sessions_${userAlias || 'default'}`;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(makeInitialGreeting());
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Load chat sessions from AsyncStorage scoped to the active user
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
            const latestSession = parsed[0];
            setCurrentSessionId(latestSession.id);
            setMessages(latestSession.messages || makeInitialGreeting());
            return;
          }
        }
        
        // If no stored sessions, initialize a brand new session
        const freshId = `session-${Date.now()}`;
        const newSession: ChatSession = {
          id: freshId,
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          messages: makeInitialGreeting()
        };
        setSessions([newSession]);
        setCurrentSessionId(freshId);
        setMessages(newSession.messages);
      } catch (e) {
        console.error('Error loading chat sessions:', e);
      }
    };
    loadSessions();
  }, [userAlias]);

  const saveSessionsToStorage = async (updatedSessions: ChatSession[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedSessions));
    } catch (e) {
      console.error('Error saving chat sessions:', e);
    }
  };

  const handleStartNewChat = () => {
    const freshId = `session-${Date.now()}`;
    const freshGreeting = makeInitialGreeting();
    const newSession: ChatSession = {
      id: freshId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: freshGreeting
    };

    const updatedSessions = [newSession, ...sessions.filter(s => s.id !== freshId)];
    setSessions(updatedSessions);
    setCurrentSessionId(freshId);
    setMessages(freshGreeting);
    saveSessionsToStorage(updatedSessions);
    setShowHistoryModal(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || makeInitialGreeting());
    setShowHistoryModal(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    saveSessionsToStorage(remaining);

    if (currentSessionId === sessionId) {
      if (remaining.length > 0) {
        handleSelectSession(remaining[0]);
      } else {
        handleStartNewChat();
      }
    }
  };

  const getAIResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    if (text.includes('stress') || text.includes('stressful') || text.includes('pressure') || text.includes('overwhelm') || text.includes('stressed')) {
      return "I understand you're feeling stressed. When pressure builds up, try taking 3 deep breaths (inhale for 4s, hold for 4s, exhale for 4s). It stimulates the vagus nerve to calm your body. Let's do it together?";
    }
    if (text.includes('sleep') || text.includes('insomnia') || text.includes('tired') || text.includes('sleeping') || text.includes('rest')) {
      return "Sleep disruptions often correlate with high cognitive activity before bed. Try avoiding screen time 30 mins before sleeping, or try a 5-minute progressive muscle relaxation. Should I guide you through it?";
    }
    if (text.includes('sad') || text.includes('down') || text.includes('depressed') || text.includes('lonely') || text.includes('hurt')) {
      return "I'm really sorry to hear you're feeling down. Remember that it's completely okay to feel this way. You don't have to carry it all alone. Writing down your specific thoughts in your Gratitude Journal can help release some weight.";
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('hello ai')) {
      return `Hello! I am Jucoch AI, your mental health companion. I'm here to listen, track your wellness patterns, and provide relaxation exercises. How can I help you today, ${userAlias || 'friend'}?`;
    }
    if (text.includes('quote') || text.includes('positive') || text.includes('mindset') || text.includes('inspire')) {
      return "🌱 Here is your reminder for today: 'You do not have to control your thoughts; you just have to stop letting them control you.' Take things one step at a time!";
    }
    if (text.includes('breathe') || text.includes('calm') || text.includes('relax') || text.includes('panic')) {
      return "🌿 Let's pause together right now. Inhale gently through your nose (1... 2... 3... 4), hold peace in your mind (1... 2... 3... 4), and exhale slowly (1... 2... 3... 4). How does your body feel now?";
    }
    if (text.includes('good') || text.includes('happy') || text.includes('great') || text.includes('amazing')) {
      return "That's wonderful to hear! Capitalizing on positive moments is just as important for building emotional resilience. What made today feel so good?";
    }
    return "Thank you for sharing that with me. I'm analyzing your thoughts with care. Remember, taking baby steps matters. What is one small kind thing you can do for yourself in the next 5 minutes?";
  };

  const sendMessage = async (overrideText?: string) => {
    const query = (overrideText || inputText).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: query,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');

    // Update session title dynamically if it is still generic
    const currentSession = sessions.find(s => s.id === currentSessionId);
    let sessionTitle = currentSession?.title || 'Conversation';
    if (sessionTitle === 'New Conversation' || !sessionTitle) {
      sessionTitle = query.slice(0, 32) + (query.length > 32 ? '...' : '');
    }

    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, title: sessionTitle, messages: updatedMessages };
      }
      return s;
    });

    setSessions(updatedSessions);
    saveSessionsToStorage(updatedSessions);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setIsTyping(true);

    try {
      const res = await sendAiChatApi(query);
      const aiResponseText = res?.reply || getAIResponse(query);
      const aiMsg: Message = {
        id: `ai-${Date.now() + 1}`,
        text: aiResponseText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);

      const finalSessions = updatedSessions.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: finalMessages };
        }
        return s;
      });
      setSessions(finalSessions);
      saveSessionsToStorage(finalSessions);
    } catch (error) {
      const fallbackText = getAIResponse(query);
      const aiMsg: Message = {
        id: `ai-${Date.now() + 1}`,
        text: fallbackText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);

      const finalSessions = updatedSessions.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: finalMessages };
        }
        return s;
      });
      setSessions(finalSessions);
      saveSessionsToStorage(finalSessions);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const QUICK_PROMPTS = [
    '💡 I feel stressed & overwhelmed',
    '😴 How can I sleep better?',
    '🎯 Give me a positive mindset quote',
    '🧘 Help me calm down & breathe',
  ];

  const handleQuickPromptPress = (promptText: string) => {
    sendMessage(promptText);
  };

  const formatSessionDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={[styles.container, { backgroundColor: dynamicBg }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.aiInfoRow}>
            <View style={styles.avatarOutline}>
              <Avatar.Text size={38} label="AI" style={{ backgroundColor: JUCOCH_GREEN }} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text variant="titleMedium" style={[styles.aiName, { color: dynamicText }]}>Jucoch AI</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text variant="bodySmall" style={[styles.statusText, { color: dynamicSub }]}>
                  {isTyping ? 'Analyzing thoughts...' : 'Online & Listening'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons: Chat History & New Chat */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => setShowHistoryModal(true)}
              style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? '#1E3A2B' : '#E8F5E9' }]}
              activeOpacity={0.75}
            >
              <History size={14} color={JUCOCH_GREEN} style={{ marginRight: 4 }} />
              <Text style={styles.headerActionText}>History ({sessions.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleStartNewChat}
              style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? '#1E3A2B' : '#E8F5E9' }]}
              activeOpacity={0.75}
            >
              <RotateCcw size={14} color={JUCOCH_GREEN} style={{ marginRight: 4 }} />
              <Text style={styles.headerActionText}>New Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>

      {/* Chat Messages Area */}
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
              <Surface style={[styles.bubble, styles.aiBubble, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={1}>
                <Text style={[styles.messageText, { color: dynamicText }]}>
                  {msg.text}
                </Text>
              </Surface>
            )}
            <Text style={[styles.timeText, { color: dynamicSub }]}>{msg.time}</Text>
          </View>
        ))}

        {/* Loading typing bubble */}
        {isTyping && (
          <View style={[styles.messageWrapper, styles.aiWrapper]}>
            <Surface style={[styles.bubble, styles.aiBubble, styles.typingBubble, { backgroundColor: dynamicCardBg }]} elevation={1}>
              <Text style={styles.typingText}>Jucoch AI is typing...</Text>
            </Surface>
          </View>
        )}
      </ScrollView>

      {/* Bottom Floating Area: Quick Prompts + Input Bar */}
      <View style={styles.bottomControlArea}>
        
        {/* Quick Prompts Row (Clickable instant prompts) */}
        <View style={styles.quickPromptSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.quickPromptScroll}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={[styles.quickPromptChip, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]}
                onPress={() => handleQuickPromptPress(prompt)}
                activeOpacity={0.7}
              >
                <Sparkles size={12} color={JUCOCH_GREEN} style={{ marginRight: 4 }} />
                <Text style={[styles.quickPromptText, { color: dynamicText }]}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputSection}>
          <Surface style={[styles.inputContainer, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={2}>
            <TextInput
              placeholder="Share your thoughts or ask for advice..."
              value={inputText}
              onChangeText={setInputText}
              style={[styles.textInput, { color: dynamicText }]}
              multiline
              placeholderTextColor={dynamicSub}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.disabledSend]} 
              onPress={() => sendMessage()}
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
                <View style={[styles.sendButtonPlaceholder, { backgroundColor: isDarkMode ? '#28332C' : '#F3F8F5' }]}>
                  <Send size={16} color={dynamicSub} />
                </View>
              )}
            </TouchableOpacity>
          </Surface>
        </View>
      </View>

      {/* GEMINI-STYLE CHAT HISTORY MODAL */}
      <Portal>
        <Modal
          visible={showHistoryModal}
          onDismiss={() => setShowHistoryModal(false)}
          contentContainerStyle={styles.modalContentContainer}
        >
          <Surface style={[styles.historyModalCard, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} elevation={5}>
            <View style={styles.historyModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <History size={20} color={JUCOCH_GREEN} style={{ marginRight: 8 }} />
                <Text style={[styles.historyModalTitle, { color: dynamicText }]}>Chat History</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={20} color={dynamicSub} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.historyModalSub, { color: dynamicSub }]}>
              Review or resume previous conversations with Jucoch AI.
            </Text>

            <TouchableOpacity 
              style={styles.startNewChatBtn} 
              onPress={handleStartNewChat}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.startNewChatBtnText}>Start Fresh Conversation</Text>
            </TouchableOpacity>

            <Divider style={{ marginVertical: 14 }} />

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {sessions.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <MessageSquare size={32} color={dynamicSub} style={{ marginBottom: 8 }} />
                  <Text style={[styles.emptyHistoryText, { color: dynamicSub }]}>No chat history recorded yet.</Text>
                </View>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === currentSessionId;
                  return (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.sessionItem,
                        { backgroundColor: isDarkMode ? '#161D19' : '#F7FBF8', borderColor: dynamicBorder },
                        isActive && { borderColor: JUCOCH_GREEN, backgroundColor: isDarkMode ? '#1D2E24' : '#E8F5EE' }
                      ]}
                      onPress={() => handleSelectSession(session)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.sessionIconBg, { backgroundColor: isActive ? JUCOCH_GREEN : (isDarkMode ? '#25352A' : '#E0ECE4') }]}>
                        <Bot size={16} color={isActive ? '#FFF' : JUCOCH_GREEN} />
                      </View>

                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <Text 
                          style={[styles.sessionTitleText, { color: dynamicText }, isActive && { color: JUCOCH_GREEN, fontWeight: 'bold' }]}
                          numberOfLines={1}
                        >
                          {session.title}
                        </Text>
                        <Text style={[styles.sessionDateText, { color: dynamicSub }]}>
                          {formatSessionDate(session.createdAt)} • {session.messages.length} messages
                        </Text>
                      </View>

                      <TouchableOpacity 
                        onPress={() => handleDeleteSession(session.id)}
                        style={styles.deleteSessionBtn}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={14} color="#FF6B6B" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.closeModalBtn, { backgroundColor: dynamicCardBg, borderColor: dynamicBorder }]} 
              onPress={() => setShowHistoryModal(false)}
            >
              <Text style={[styles.closeModalBtnText, { color: dynamicSub }]}>Close</Text>
            </TouchableOpacity>
          </Surface>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
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
    marginLeft: 10,
  },
  aiName: {
    fontWeight: 'bold',
    fontSize: 16,
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
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  headerActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: JUCOCH_GREEN,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 14,
    maxWidth: '85%',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: 13,
    borderRadius: 20,
  },
  aiBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  userBubble: {
    borderTopRightRadius: 4,
    elevation: 3,
    shadowColor: JUCOCH_GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  typingBubble: {
    borderStyle: 'dashed',
    borderColor: JUCOCH_GREEN,
  },
  typingText: {
    fontSize: 12,
    color: JUCOCH_GREEN,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFF',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    marginHorizontal: 6,
    alignSelf: 'flex-end',
  },
  bottomControlArea: {
    paddingBottom: Platform.OS === 'ios' ? 95 : 88,
    backgroundColor: 'transparent',
  },
  quickPromptSection: {
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  quickPromptScroll: {
    gap: 8,
    paddingRight: 14,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputSection: {
    paddingHorizontal: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 90,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  sendButtonPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSend: {
    opacity: 0.75,
  },
  modalContentContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyModalCard: {
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  historyModalSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  startNewChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JUCOCH_GREEN,
    paddingVertical: 12,
    borderRadius: 14,
  },
  startNewChatBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  sessionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTitleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sessionDateText: {
    fontSize: 10,
    marginTop: 2,
  },
  deleteSessionBtn: {
    padding: 6,
  },
  emptyHistoryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyHistoryText: {
    fontSize: 12,
  },
  closeModalBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  closeModalBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
