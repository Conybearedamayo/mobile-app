import React, { createContext, useContext, useState, useCallback } from 'react';
import { logMoodApi, logSleepApi, logActivityApi, saveJournalApi } from '@/src/services/wellnessService';

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
  isDarkMode: boolean;
  moodLogs: MoodEntry[];
  sleepLogs: SleepEntry[];
  activityEntries: ActivityEntry[];
  journalEntries: JournalEntry[];

  // Actions
  setUserAlias: (name: string) => void;
  setUserRole: (role: string) => void;
  setUserToken: (token: string | null) => void;
  toggleDarkMode: () => void;
  addMoodLog: (log: { id: number; mood: string; emoji: string; timestamp: string }) => void;
  addSleepLog: (hours: number, quality: string) => void;
  addActivityEntry: (type: string, duration: number) => void;
  addJournalEntry: (content: string) => void;
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
  const [userAlias, setUserAlias] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [wellnessScoreState, setWellnessScoreState] = useState(78);

  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

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
    const newEntry: JournalEntry = {
      id: Date.now(),
      content,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);

    // Async sync to Neon PostgreSQL backend for Admin Live Audit Feed
    saveJournalApi(userToken || '', content).catch(() => {});
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
    isDarkMode,
    moodLogs,
    sleepLogs,
    activityEntries,
    journalEntries,
    setUserAlias,
    setUserRole,
    setUserToken,
    toggleDarkMode,
    addMoodLog,
    addSleepLog,
    addActivityEntry,
    addJournalEntry,
    setWellnessScore,
    getCurrentStreak,
    getAverageMoodScore,
    getWellnessScore,
    wellnessScore: wellnessScoreState,
  };

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
};
