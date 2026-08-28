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
import { updatePrivacySettingsApi } from '@/src/services/authService';

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
  isMasked: boolean;
  moodLogs: MoodEntry[];
  sleepLogs: SleepEntry[];
  activityEntries: ActivityEntry[];
  journalEntries: JournalEntry[];

  // Actions
  setUserAlias: (name: string) => void;
  setUserRole: (role: string) => void;
  setUserToken: (token: string | null) => void;
  setIsMasked: (val: boolean) => void;
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
  const [isMasked, setIsMaskedState] = useState(false);
  const [wellnessScoreState, setWellnessScoreState] = useState(0);

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
          const mappedMoods = data.moodLogs.map((m: any) => ({
            id: m.id,
            mood: m.mood,
            emoji: m.emoji,
            timestamp: m.createdAt || new Date().toISOString(),
            note: m.note,
          }));
          setMoodLogs(mappedMoods);
          AsyncStorage.setItem('@jucoch_local_mood_logs', JSON.stringify(mappedMoods)).catch(() => {});
        }
        if (Array.isArray(data.sleepLogs)) {
          const mappedSleep = data.sleepLogs.map((s: any) => ({
            id: s.id,
            hours: s.hours,
            quality: s.quality,
            timestamp: s.createdAt || new Date().toISOString(),
          }));
          setSleepLogs(mappedSleep);
          AsyncStorage.setItem('@jucoch_local_sleep_logs', JSON.stringify(mappedSleep)).catch(() => {});
        }
        if (Array.isArray(data.activityLogs)) {
          const mappedActivities = data.activityLogs.map((a: any) => ({
            id: a.id,
            type: a.type,
            duration: a.duration,
            timestamp: a.createdAt || new Date().toISOString(),
          }));
          setActivityEntries(mappedActivities);
          AsyncStorage.setItem('@jucoch_local_activity_logs', JSON.stringify(mappedActivities)).catch(() => {});
        }
        if (Array.isArray(data.journalEntries)) {
          const mappedJournals = data.journalEntries.map((j: any) => ({
            id: j.id,
            content: j.content,
            timestamp: j.createdAt || new Date().toISOString(),
          }));
          setJournalEntries(mappedJournals);
          AsyncStorage.setItem('@jucoch_local_journal_logs', JSON.stringify(mappedJournals)).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Error syncing user cloud wellness data:', err);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (userToken) {
      await syncUserDataFromCloud(userToken);
    }
  }, [userToken, syncUserDataFromCloud]);

  // Load persisted session and offline cached logs on startup
  useEffect(() => {
    const loadPersistedAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@jucoch_user_token');
        const storedAlias = await AsyncStorage.getItem('@jucoch_user_alias');
        const storedRole = await AsyncStorage.getItem('@jucoch_user_role');
        const storedMasked = await AsyncStorage.getItem('@jucoch_user_masked');
        
        // Load local cached logs so UI is immediately populated
        const storedMoods = await AsyncStorage.getItem('@jucoch_local_mood_logs');
        if (storedMoods) {
          try {
            const parsed = JSON.parse(storedMoods);
            if (Array.isArray(parsed)) setMoodLogs(parsed);
          } catch (e) {}
        }
        const storedSleep = await AsyncStorage.getItem('@jucoch_local_sleep_logs');
        if (storedSleep) {
          try {
            const parsed = JSON.parse(storedSleep);
            if (Array.isArray(parsed)) setSleepLogs(parsed);
          } catch (e) {}
        }
        const storedActivities = await AsyncStorage.getItem('@jucoch_local_activity_logs');
        if (storedActivities) {
          try {
            const parsed = JSON.parse(storedActivities);
            if (Array.isArray(parsed)) setActivityEntries(parsed);
          } catch (e) {}
        }
        const storedJournals = await AsyncStorage.getItem('@jucoch_local_journal_logs');
        if (storedJournals) {
          try {
            const parsed = JSON.parse(storedJournals);
            if (Array.isArray(parsed)) setJournalEntries(parsed);
          } catch (e) {}
        }

        if (storedToken) {
          setUserTokenState(storedToken);
          if (storedAlias) setUserAliasState(storedAlias);
          if (storedRole) setUserRoleState(storedRole);
          if (storedMasked === 'true') setIsMaskedState(true);
          // Sync fresh user data from database immediately
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

  const setIsMasked = useCallback((val: boolean) => {
    setIsMaskedState(val);
    AsyncStorage.setItem('@jucoch_user_masked', String(val)).catch(console.error);
    if (userToken) {
      updatePrivacySettingsApi(userToken, val).catch(console.error);
    }
  }, [userToken]);

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
        '@jucoch_local_mood_logs',
        '@jucoch_local_sleep_logs',
        '@jucoch_local_activity_logs',
        '@jucoch_local_journal_logs',
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
    setWellnessScoreState(0);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const addMoodLog = useCallback((logInput: { id: number; mood: string; emoji: string; timestamp: string }) => {
    const newEntry: MoodEntry = {
      id: logInput.id || Date.now(),
      mood: logInput.mood,
      emoji: logInput.emoji,
      timestamp: logInput.timestamp || new Date().toISOString(),
    };
    setMoodLogs((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem('@jucoch_local_mood_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    logMoodApi(userToken || '', logInput.mood, logInput.emoji).catch(() => {});
  }, [userToken]);

  const addSleepLog = useCallback((hours: number, quality: string) => {
    const newEntry: SleepEntry = {
      id: Date.now(),
      hours,
      quality,
      timestamp: new Date().toISOString(),
    };
    setSleepLogs((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem('@jucoch_local_sleep_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    logSleepApi(userToken || '', hours, quality).catch(() => {});
  }, [userToken]);

  const addActivityEntry = useCallback((type: string, duration: number) => {
    const newEntry: ActivityEntry = {
      id: Date.now(),
      type,
      duration,
      timestamp: new Date().toISOString(),
    };
    setActivityEntries((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem('@jucoch_local_activity_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    logActivityApi(userToken || '', type, duration).catch(() => {});
  }, [userToken]);

  const addJournalEntry = useCallback((content: string) => {
    const newId = Date.now();
    const newEntry: JournalEntry = {
      id: newId,
      content,
      timestamp: new Date().toISOString(),
    };
    setJournalEntries((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem('@jucoch_local_journal_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    saveJournalApi(userToken || '', content)
      .then((res) => {
        if (res?.journalEntry?.id) {
          setJournalEntries((prev) => {
            const updated = prev.map((j) => (j.id === newId ? { ...j, id: res.journalEntry.id } : j));
            AsyncStorage.setItem('@jucoch_local_journal_logs', JSON.stringify(updated)).catch(() => {});
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [userToken]);

  const editJournalEntry = useCallback((id: string | number, newContent: string) => {
    setJournalEntries((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, content: newContent } : j));
      AsyncStorage.setItem('@jucoch_local_journal_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string') {
      updateJournalApi(userToken || '', id, newContent).catch(() => {});
    }
  }, [userToken]);

  const deleteJournalEntry = useCallback((id: string | number) => {
    setJournalEntries((prev) => {
      const updated = prev.filter((j) => j.id !== id);
      AsyncStorage.setItem('@jucoch_local_journal_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string') {
      deleteJournalApi(userToken || '', id).catch(() => {});
    }
  }, [userToken]);

  const getCurrentStreak = useCallback(() => {
    const total = moodLogs.length + sleepLogs.length;
    return total === 0 ? 0 : total;
  }, [moodLogs.length, sleepLogs.length]);

  const getAverageMoodScore = useCallback(() => {
    if (moodLogs.length === 0) return 0;
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
    if (moodLogs.length === 0 && sleepLogs.length === 0) return 0;
    const avgMood = getAverageMoodScore();
    const streak = getCurrentStreak();
    const baseScore = Math.round(avgMood * 8 + Math.min(streak * 2, 20));
    return Math.min(100, Math.max(10, baseScore));
  }, [getAverageMoodScore, getCurrentStreak, moodLogs.length, sleepLogs.length]);

  const setWellnessScore = useCallback((score: number) => {
    setWellnessScoreState(score);
  }, []);

  const dynamicWellnessScore = wellnessScoreState > 0 ? wellnessScoreState : getWellnessScore();

  const value = {
    userAlias,
    userRole,
    userToken,
    isAuthLoading,
    isDarkMode,
    isMasked,
    moodLogs,
    sleepLogs,
    activityEntries,
    journalEntries,
    setUserAlias,
    setUserRole,
    setUserToken,
    setIsMasked,
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
    wellnessScore: dynamicWellnessScore,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
};
