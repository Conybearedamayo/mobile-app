import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  logMoodApi, 
  logSleepApi, 
  logActivityApi, 
  saveJournalApi, 
  updateJournalApi, 
  deleteJournalApi,
  fetchAllWellnessDataApi
} from '@/src/services/wellnessService';

// Define the types for our wellness data - Synced with Screen naming conventions
export type MoodEntry = {
  id: string | number;
  mood: string;
  emoji: string;
  timestamp: string;
  note?: string;
};

export type SleepEntry = {
  id: string | number;
  hours: number;
  quality: string; 
  timestamp: string;
};

export type ActivityEntry = {
  id: string | number;
  type: string; 
  duration: number; 
  timestamp: string;
};

export type JournalEntry = {
  id: string | number;
  content: string;
  timestamp: string;
};

export type WellnessState = {
  userAlias: string;
  userRole: string;
  userToken: string | null;
  isAuthLoading: boolean;
  isDarkMode: boolean;
  moodLogs: MoodEntry[];
  sleepLogs: SleepEntry[];
  activityEntries: ActivityEntry[];
  journalEntries: JournalEntry[];

  // Actions
  setUserAlias: (name: string) => void;
  setUserRole: (role: string) => void;
  setUserToken: (token: string | null) => void;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
  addMoodLog: (log: { id: number; mood: string; emoji: string; timestamp: string }) => void;
  addSleepLog: (hours: number, quality: string) => void;
  addActivityEntry: (type: string, duration: number) => void;
  addJournalEntry: (content: string) => void;
  editJournalEntry: (id: string | number, newContent: string) => void;
  deleteJournalEntry: (id: string | number) => void;
  setWellnessScore: (score: number) => void;

  // Computed values
  getCurrentStreak: () => number;
  getAverageMoodScore: () => number;
  getWellnessScore: () => number;
  wellnessScore: number;
};

const WellnessContext = createContext<WellnessState | undefined>(undefined);

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};

export const WellnessProvider = ({ children }: { children: React.ReactNode }) => {
  const [userAlias, setUserAliasState] = useState('');
  const [userRole, setUserRoleState] = useState('');
  const [userToken, setUserTokenState] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [wellnessScoreState, setWellnessScoreState] = useState(78);

  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const syncUserDataFromCloud = useCallback(async (token: string) => {
    if (!token) return;
    try {
      const data = await fetchAllWellnessDataApi(token);
      if (data) {
        if (Array.isArray(data.moodLogs)) {
          setMoodLogs(data.moodLogs.map((m: any) => ({
            id: m.id,
            mood: m.mood,
            emoji: m.emoji,
            timestamp: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: m.note,
          })));
        }
        if (Array.isArray(data.sleepLogs)) {
          setSleepLogs(data.sleepLogs.map((s: any) => ({
            id: s.id,
            hours: s.hours,
            quality: s.quality,
            timestamp: s.createdAt
              ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          })));
        }
        if (Array.isArray(data.activityLogs)) {
          setActivityEntries(data.activityLogs.map((a: any) => ({
            id: a.id,
            type: a.type,
            duration: a.duration,
            timestamp: a.createdAt
              ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          })));
        }
        if (Array.isArray(data.journalEntries)) {
          setJournalEntries(data.journalEntries.map((j: any) => ({
            id: j.id,
            content: j.content,
            timestamp: j.createdAt
              ? new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          })));
        }
      }
    } catch (err) {
      console.warn('Failed to sync user records from cloud:', err);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (userToken) {
      await syncUserDataFromCloud(userToken);
    }
  }, [userToken, syncUserDataFromCloud]);

  // Load persisted session on startup
  useEffect(() => {
    const loadPersistedAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@jucoch_user_token');
        const storedAlias = await AsyncStorage.getItem('@jucoch_user_alias');
        const storedRole = await AsyncStorage.getItem('@jucoch_user_role');
        if (storedToken) {
          setUserTokenState(storedToken);
          if (storedAlias) setUserAliasState(storedAlias);
          if (storedRole) setUserRoleState(storedRole);
          // Sync existing user data from database immediately
          syncUserDataFromCloud(storedToken);
        }
      } catch (err) {
        console.error('Failed to load persisted auth session:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadPersistedAuth();
  }, [syncUserDataFromCloud]);

  const setUserToken = useCallback((token: string | null) => {
    setUserTokenState(token);
    if (token) {
      AsyncStorage.setItem('@jucoch_user_token', token).catch(console.error);
      syncUserDataFromCloud(token);
    } else {
      AsyncStorage.removeItem('@jucoch_user_token').catch(console.error);
    }
  }, [syncUserDataFromCloud]);

  const setUserAlias = useCallback((alias: string) => {
    setUserAliasState(alias);
    if (alias) {
      AsyncStorage.setItem('@jucoch_user_alias', alias).catch(console.error);
    } else {
      AsyncStorage.removeItem('@jucoch_user_alias').catch(console.error);
    }
  }, []);

  const setUserRole = useCallback((role: string) => {
    setUserRoleState(role);
    if (role) {
      AsyncStorage.setItem('@jucoch_user_role', role).catch(console.error);
    } else {
      AsyncStorage.removeItem('@jucoch_user_role').catch(console.error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        '@jucoch_user_token',
        '@jucoch_user_alias',
        '@jucoch_user_role',
      ]);
    } catch (e) {
      console.error('Error clearing auth storage:', e);
    }
    setUserTokenState(null);
    setUserAliasState('');
    setUserRoleState('');
    setMoodLogs([]);
    setSleepLogs([]);
    setActivityEntries([]);
    setJournalEntries([]);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const addMoodLog = useCallback((logInput: { id: number; mood: string; emoji: string; timestamp: string }) => {
    const newEntry: MoodEntry = {
      id: logInput.id || Date.now(),
      mood: logInput.mood,
      emoji: logInput.emoji,
      timestamp: logInput.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMoodLogs((prev) => [newEntry, ...prev]);

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    logMoodApi(userToken || '', logInput.mood, logInput.emoji).catch(() => {});
  }, [userToken]);

  const addSleepLog = useCallback((hours: number, quality: string) => {
    const newEntry: SleepEntry = {
      id: Date.now(),
      hours,
      quality,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    setSleepLogs((prev) => [newEntry, ...prev]);

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    logSleepApi(userToken || '', hours, quality).catch(() => {});
  }, [userToken]);

  const addActivityEntry = useCallback((type: string, duration: number) => {
    const newEntry: ActivityEntry = {
      id: Date.now(),
      type,
      duration,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    setActivityEntries((prev) => [newEntry, ...prev]);

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    logActivityApi(userToken || '', type, duration).catch(() => {});
  }, [userToken]);

  const addJournalEntry = useCallback((content: string) => {
    const newId = Date.now();
    const newEntry: JournalEntry = {
      id: newId,
      content,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    saveJournalApi(userToken || '', content)
      .then((res) => {
        if (res?.journalEntry?.id) {
          setJournalEntries((prev) =>
            prev.map((j) => (j.id === newId ? { ...j, id: res.journalEntry.id } : j))
          );
        }
      })
      .catch(() => {});
  }, [userToken]);

  const editJournalEntry = useCallback((id: string | number, newContent: string) => {
    setJournalEntries((prev) =>
      prev.map((j) => (j.id === id ? { ...j, content: newContent } : j))
    );
    if (typeof id === 'string') {
      updateJournalApi(userToken || '', id, newContent).catch(() => {});
    }
  }, [userToken]);

  const deleteJournalEntry = useCallback((id: string | number) => {
    setJournalEntries((prev) => prev.filter((j) => j.id !== id));
    if (typeof id === 'string') {
      deleteJournalApi(userToken || '', id).catch(() => {});
    }
  }, [userToken]);

  const getCurrentStreak = useCallback(() => {
    return Math.max(1, moodLogs.length + sleepLogs.length);
  }, [moodLogs.length, sleepLogs.length]);

  const getAverageMoodScore = useCallback(() => {
    if (moodLogs.length === 0) return 7.5;
    const moodValues: Record<string, number> = {
      Awful: 2,
      Bad: 4,
      Good: 6,
      Great: 8,
      Amazing: 10,
    };
    const total = moodLogs.reduce((acc, log) => acc + (moodValues[log.mood] || 7), 0);
    return parseFloat((total / moodLogs.length).toFixed(1));
  }, [moodLogs]);

  const getWellnessScore = useCallback(() => {
    const avgMood = getAverageMoodScore();
    const streak = getCurrentStreak();
    const baseScore = Math.round(avgMood * 8 + Math.min(streak * 2, 20));
    return Math.min(100, Math.max(30, baseScore));
  }, [getAverageMoodScore, getCurrentStreak]);

  const setWellnessScore = useCallback((score: number) => {
    setWellnessScoreState(score);
  }, []);

  const value = {
    userAlias,
    userRole,
    userToken,
    isAuthLoading,
    isDarkMode,
    moodLogs,
    sleepLogs,
    activityEntries,
    journalEntries,
    setUserAlias,
    setUserRole,
    setUserToken,
    refreshUserData,
    logout,
    toggleDarkMode,
    addMoodLog,
    addSleepLog,
    addActivityEntry,
    addJournalEntry,
    editJournalEntry,
    deleteJournalEntry,
    setWellnessScore,
    getCurrentStreak,
    getAverageMoodScore,
    getWellnessScore,
    wellnessScore: wellnessScoreState,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
};
