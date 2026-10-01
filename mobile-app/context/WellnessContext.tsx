import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  logMoodApi, 
  updateMoodApi,
  deleteMoodApi,
  logSleepApi, 
  updateSleepApi,
  deleteSleepApi,
  logActivityApi, 
  updateActivityApi,
  deleteActivityApi,
  saveJournalApi, 
  updateJournalApi, 
  deleteJournalApi,
  fetchAllWellnessDataApi
} from '@/src/services/wellnessService';
import { updatePrivacySettingsApi, updateUserAliasApi } from '@/src/services/authService';

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

export type NotificationPrefs = {
  dailyCheckin: boolean;
  bedtimePrompt: boolean;
  studyBreak: boolean;
  aiDistressAlert: boolean;
};

export type WellnessState = {
  userAlias: string;
  userRole: string;
  userToken: string | null;
  userAvatar: string;
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
  setUserAvatar: (avatar: string) => void;
  setIsMasked: (val: boolean) => void;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
  addMoodLog: (log: { id?: number | string; mood: string; emoji: string; timestamp?: string; note?: string }) => void;
  editMoodLog: (id: string | number, mood: string, emoji: string, note?: string) => void;
  deleteMoodLog: (id: string | number) => void;
  addSleepLog: (hours: number, quality: string) => void;
  editSleepLog: (id: string | number, hours: number, quality: string) => void;
  deleteSleepLog: (id: string | number) => void;
  addActivityEntry: (type: string, duration: number) => void;
  editActivityEntry: (id: string | number, type: string, duration: number) => void;
  deleteActivityEntry: (id: string | number) => void;
  addJournalEntry: (content: string) => void;
  editJournalEntry: (id: string | number, newContent: string) => void;
  deleteJournalEntry: (id: string | number) => void;
  setWellnessScore: (score: number) => void;

  // Notifications
  notificationPrefs: NotificationPrefs;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;

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
  const [userAvatar, setUserAvatarState] = useState('🌿');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMasked, setIsMaskedState] = useState(false);
  const [wellnessScoreState, setWellnessScoreState] = useState(0);

  const [notificationPrefs, setNotificationPrefsState] = useState<NotificationPrefs>({
    dailyCheckin: true,
    bedtimePrompt: true,
    studyBreak: true,
    aiDistressAlert: true,
  });

  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const syncUserDataFromCloud = useCallback(async (token: string) => {
    if (!token) return;
    try {
      const data = await fetchAllWellnessDataApi(token);
      if (data) {
        const mappedMoods = Array.isArray(data.moodLogs) ? data.moodLogs.map((m: any) => ({
          id: m.id,
          mood: m.mood,
          emoji: m.emoji,
          timestamp: m.createdAt || new Date().toISOString(),
          note: m.note,
        })) : [];
        setMoodLogs(mappedMoods);
        AsyncStorage.setItem('@jucoch_local_mood_logs', JSON.stringify(mappedMoods)).catch(() => {});

        const mappedSleep = Array.isArray(data.sleepLogs) ? data.sleepLogs.map((s: any) => ({
          id: s.id,
          hours: s.hours,
          quality: s.quality,
          timestamp: s.createdAt || new Date().toISOString(),
        })) : [];
        setSleepLogs(mappedSleep);
        AsyncStorage.setItem('@jucoch_local_sleep_logs', JSON.stringify(mappedSleep)).catch(() => {});

        const mappedActivities = Array.isArray(data.activityLogs) ? data.activityLogs.map((a: any) => ({
          id: a.id,
          type: a.type,
          duration: a.duration,
          timestamp: a.createdAt || new Date().toISOString(),
        })) : [];
        setActivityEntries(mappedActivities);
        AsyncStorage.setItem('@jucoch_local_activity_logs', JSON.stringify(mappedActivities)).catch(() => {});

        const mappedJournals = Array.isArray(data.journalEntries) ? data.journalEntries.map((j: any) => ({
          id: j.id,
          content: j.content,
          timestamp: j.createdAt || new Date().toISOString(),
        })) : [];
        setJournalEntries(mappedJournals);
        AsyncStorage.setItem('@jucoch_local_journal_logs', JSON.stringify(mappedJournals)).catch(() => {});
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
        const storedAvatar = await AsyncStorage.getItem('@jucoch_user_avatar');
        if (storedAvatar) setUserAvatarState(storedAvatar);
        
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

        const storedNotifPrefs = await AsyncStorage.getItem('@jucoch_smart_notif_prefs');
        if (storedNotifPrefs) {
          try {
            const parsed = JSON.parse(storedNotifPrefs);
            if (parsed && typeof parsed === 'object') {
              setNotificationPrefsState((prev) => ({ ...prev, ...parsed }));
            }
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

  const updateNotificationPrefs = useCallback((prefs: Partial<NotificationPrefs>) => {
    setNotificationPrefsState((prev) => {
      const updated = { ...prev, ...prefs };
      AsyncStorage.setItem('@jucoch_smart_notif_prefs', JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const setIsMasked = useCallback((val: boolean) => {
    setIsMaskedState(val);
    AsyncStorage.setItem('@jucoch_user_masked', String(val)).catch(console.error);
    if (userToken) {
      updatePrivacySettingsApi(userToken, val).catch(console.error);
    }
  }, [userToken]);

  const setUserToken = useCallback((token: string | null) => {
    setUserTokenState(token);
    // Reset in-memory logs immediately so new account starts 100% clean
    setMoodLogs([]);
    setSleepLogs([]);
    setActivityEntries([]);
    setJournalEntries([]);
    setWellnessScoreState(0);
    AsyncStorage.multiRemove([
      '@jucoch_local_mood_logs',
      '@jucoch_local_sleep_logs',
      '@jucoch_local_activity_logs',
      '@jucoch_local_journal_logs',
    ]).catch(() => {});

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
      if (userToken) {
        updateUserAliasApi(userToken, alias).catch((err) => {
          console.warn('Background alias sync warning:', err);
        });
      }
    } else {
      AsyncStorage.removeItem('@jucoch_user_alias').catch(console.error);
    }
  }, [userToken]);

  const setUserRole = useCallback((role: string) => {
    setUserRoleState(role);
    if (role) {
      AsyncStorage.setItem('@jucoch_user_role', role).catch(console.error);
    } else {
      AsyncStorage.removeItem('@jucoch_user_role').catch(console.error);
    }
  }, []);

  const setUserAvatar = useCallback((avatar: string) => {
    setUserAvatarState(avatar);
    if (avatar) {
      AsyncStorage.setItem('@jucoch_user_avatar', avatar).catch(console.error);
    } else {
      AsyncStorage.removeItem('@jucoch_user_avatar').catch(console.error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        '@jucoch_user_token',
        '@jucoch_user_alias',
        '@jucoch_user_role',
        '@jucoch_user_avatar',
        '@jucoch_tour_shown',
        '@jucoch_local_mood_logs',
        '@jucoch_local_sleep_logs',
        '@jucoch_local_activity_logs',
        '@jucoch_local_journal_logs',
        '@jucoch_ai_sessions_unified',
        '@jucoch_ai_sessions_active_user',
        '@jucoch_ai_sessions_default',
      ]);
    } catch (e) {
      console.error('Error clearing auth storage:', e);
    }
    setUserTokenState(null);
    setUserAliasState('');
    setUserRoleState('');
    setUserAvatarState('🌿');
    setMoodLogs([]);
    setSleepLogs([]);
    setActivityEntries([]);
    setJournalEntries([]);
    setWellnessScoreState(0);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const addMoodLog = useCallback((logInput: { id?: number | string; mood: string; emoji: string; timestamp?: string; note?: string }) => {
    const tempId = logInput.id || Date.now();
    const newEntry: MoodEntry = {
      id: tempId,
      mood: logInput.mood,
      emoji: logInput.emoji,
      timestamp: logInput.timestamp || new Date().toISOString(),
      note: logInput.note,
    };
    setMoodLogs((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem('@jucoch_local_mood_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    logMoodApi(userToken || '', logInput.mood, logInput.emoji, logInput.note)
      .then((res) => {
        if (res?.moodLog?.id) {
          setMoodLogs((prev) => {
            const updated = prev.map((m) => (m.id === tempId ? { ...m, id: res.moodLog.id } : m));
            AsyncStorage.setItem('@jucoch_local_mood_logs', JSON.stringify(updated)).catch(() => {});
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [userToken]);

  const editMoodLog = useCallback((id: string | number, mood: string, emoji: string, note?: string) => {
    setMoodLogs((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, mood, emoji, note } : m));
      AsyncStorage.setItem('@jucoch_local_mood_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string' && userToken) {
      updateMoodApi(userToken, id, mood, emoji, note).catch(() => {});
    }
  }, [userToken]);

  const deleteMoodLog = useCallback((id: string | number) => {
    setMoodLogs((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem('@jucoch_local_mood_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string' && userToken) {
      deleteMoodApi(userToken, id).catch(() => {});
    }
  }, [userToken]);

  const addSleepLog = useCallback((hours: number, quality: string) => {
    const tempId = Date.now();
    const newEntry: SleepEntry = {
      id: tempId,
      hours,
      quality,
      timestamp: new Date().toISOString(),
    };
    setSleepLogs((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem('@jucoch_local_sleep_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    logSleepApi(userToken || '', hours, quality)
      .then((res) => {
        if (res?.sleepLog?.id) {
          setSleepLogs((prev) => {
            const updated = prev.map((s) => (s.id === tempId ? { ...s, id: res.sleepLog.id } : s));
            AsyncStorage.setItem('@jucoch_local_sleep_logs', JSON.stringify(updated)).catch(() => {});
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [userToken]);

  const editSleepLog = useCallback((id: string | number, hours: number, quality: string) => {
    setSleepLogs((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, hours, quality } : s));
      AsyncStorage.setItem('@jucoch_local_sleep_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string' && userToken) {
      updateSleepApi(userToken, id, hours, quality).catch(() => {});
    }
  }, [userToken]);

  const deleteSleepLog = useCallback((id: string | number) => {
    setSleepLogs((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      AsyncStorage.setItem('@jucoch_local_sleep_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string' && userToken) {
      deleteSleepApi(userToken, id).catch(() => {});
    }
  }, [userToken]);

  const addActivityEntry = useCallback((type: string, duration: number) => {
    const tempId = Date.now();
    const newEntry: ActivityEntry = {
      id: tempId,
      type,
      duration,
      timestamp: new Date().toISOString(),
    };
    setActivityEntries((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem('@jucoch_local_activity_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    logActivityApi(userToken || '', type, duration)
      .then((res) => {
        if (res?.activityLog?.id) {
          setActivityEntries((prev) => {
            const updated = prev.map((a) => (a.id === tempId ? { ...a, id: res.activityLog.id } : a));
            AsyncStorage.setItem('@jucoch_local_activity_logs', JSON.stringify(updated)).catch(() => {});
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [userToken]);

  const editActivityEntry = useCallback((id: string | number, type: string, duration: number) => {
    setActivityEntries((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, type, duration } : a));
      AsyncStorage.setItem('@jucoch_local_activity_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string' && userToken) {
      updateActivityApi(userToken, id, type, duration).catch(() => {});
    }
  }, [userToken]);

  const deleteActivityEntry = useCallback((id: string | number) => {
    setActivityEntries((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      AsyncStorage.setItem('@jucoch_local_activity_logs', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    if (typeof id === 'string' && userToken) {
      deleteActivityApi(userToken, id).catch(() => {});
    }
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
    const allTimestamps: string[] = [
      ...moodLogs.map((m) => m.timestamp),
      ...sleepLogs.map((s) => s.timestamp),
      ...activityEntries.map((a) => a.timestamp),
      ...journalEntries.map((j) => j.timestamp),
    ].filter(Boolean);

    if (allTimestamps.length === 0) return 0;

    const dateSet = new Set<string>();
    for (const ts of allTimestamps) {
      try {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dateSet.add(`${year}-${month}-${day}`);
        }
      } catch (e) {}
    }

    if (dateSet.size === 0) return 0;

    const toDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const todayStr = toDateStr(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = toDateStr(yesterday);

    // If user has not logged anything today AND not yesterday, active streak is 0
    if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    const checkDate = new Date(today);
    // If user hasn't checked in yet today, calculate active streak up to yesterday
    if (!dateSet.has(todayStr)) {
      checkDate.setDate(today.getDate() - 1);
    }

    while (dateSet.has(toDateStr(checkDate))) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }, [moodLogs, sleepLogs, activityEntries, journalEntries]);

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
    userAvatar,
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
    setUserAvatar,
    setIsMasked,
    refreshUserData,
    logout,
    toggleDarkMode,
    addMoodLog,
    editMoodLog,
    deleteMoodLog,
    addSleepLog,
    editSleepLog,
    deleteSleepLog,
    addActivityEntry,
    editActivityEntry,
    deleteActivityEntry,
    addJournalEntry,
    editJournalEntry,
    deleteJournalEntry,
    setWellnessScore,
    notificationPrefs,
    updateNotificationPrefs,
    getCurrentStreak,
    getAverageMoodScore,
    getWellnessScore,
    wellnessScore: dynamicWellnessScore,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
};
