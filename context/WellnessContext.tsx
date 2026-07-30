import React, { createContext, useContext, useState, useCallback } from 'react';

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
  moodLogs: MoodEntry[];
  sleepLogs: SleepEntry[];
  activityEntries: ActivityEntry[];
  journalEntries: JournalEntry[];

  // Actions
  setUserAlias: (name: string) => void;
  setUserRole: (role: string) => void;
  setUserToken: (token: string | null) => void;
  addMoodLog: (log: { id: number; mood: string; emoji: string; timestamp: string }) => void;
  addSleepLog: (hours: number, quality: string) => void;
  addActivityEntry: (type: string, duration: number) => void;
  addJournalEntry: (content: string) => void;
  setWellnessScore: (score: number) => void; // Added fallback to support direct setter from screen

  // Computed values
  getCurrentStreak: () => number;
  getAverageMoodScore: () => number;
  getWellnessScore: () => number;
  wellnessScore: number; // Added to match HomeScreen reference
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
  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [manualWellnessScore, setManualWellnessScore] = useState<number | null>(null);

  // Synced Action: addMoodLog
  const addMoodLog = useCallback((log: { id: number; mood: string; emoji: string; timestamp: string }) => {
    const newEntry: MoodEntry = {
      id: log.id,
      mood: log.mood,
      emoji: log.emoji,
      timestamp: log.timestamp,
    };
    setMoodLogs(prev => [newEntry, ...prev]);
  }, []);

  // Synced Action: addSleepLog
  const addSleepLog = useCallback((hours: number, quality: string) => {
    const newEntry: SleepEntry = {
      id: Date.now(),
      hours,
      quality,
      timestamp: new Date().toISOString()
    };
    setSleepLogs(prev => [newEntry, ...prev]);
  }, []);

  const addActivityEntry = useCallback((type: string, duration: number) => {
    const newEntry: ActivityEntry = {
      id: Date.now(),
      type,
      duration,
      timestamp: new Date().toISOString()
    };
    setActivityEntries(prev => [newEntry, ...prev]);
  }, []);

  const addJournalEntry = useCallback((content: string) => {
    const newEntry: JournalEntry = {
      id: Date.now(),
      content,
      timestamp: new Date().toISOString()
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  }, []);

  // Setter for manual override from screens
  const setWellnessScore = useCallback((score: number) => {
    setManualWellnessScore(score);
  }, []);

  // Computed values
  const getCurrentStreak = useCallback(() => {
    if (moodLogs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dateString = checkDate.toISOString().split('T')[0];
      const hasEntry = moodLogs.some(entry =>
        entry.timestamp.startsWith(dateString)
      );

      if (hasEntry) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [moodLogs]);

  const getAverageMoodScore = useCallback(() => {
    if (moodLogs.length === 0) return 0;

    const moodScores: Record<string, number> = {
      'Awful': 1,
      'Bad': 2,
      'Good': 3,
      'Great': 4,
      'Amazing': 5
    };

    const total = moodLogs.reduce((sum, entry) => {
      return sum + (moodScores[entry.mood] || 0);
    }, 0);

    return Math.round((total / moodLogs.length) * 2); 
  }, [moodLogs]);

  const getWellnessScore = useCallback(() => {
    // If screen explicitly saved a dynamic score via interaction, utilize it
    if (manualWellnessScore !== null) return manualWellnessScore;

    const moodScore = getAverageMoodScore(); 

    let sleepScore = 0;
    if (sleepLogs.length > 0) {
      const recentSleep = sleepLogs[0]; 
      if (recentSleep.hours >= 8) sleepScore = 10;
      else if (recentSleep.hours >= 7) sleepScore = 8;
      else if (recentSleep.hours >= 6) sleepScore = 6;
      else if (recentSleep.hours >= 5) sleepScore = 4;
      else sleepScore = 2;
    }

    let activityScore = 0;
    if (activityEntries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const hasRecentActivity = activityEntries.some(entry => {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });

      activityScore = hasRecentActivity ? 8 : 4;
    }

    // Return localized calculation scale out of 100
    return Math.round((moodScore * 0.5 + sleepScore * 0.3 + activityScore * 0.2) * 10);
  }, [getAverageMoodScore, activityEntries.length, sleepLogs.length, manualWellnessScore]);

  const value = {
    userAlias,
    userRole,
    userToken,
    moodLogs,
    sleepLogs,
    activityEntries,
    journalEntries,
    setUserAlias,
    setUserRole,
    setUserToken,
    addMoodLog,
    addSleepLog,
    addActivityEntry,
    addJournalEntry,
    setWellnessScore,
    getCurrentStreak,
    getAverageMoodScore,
    getWellnessScore,
    wellnessScore: getWellnessScore() // Evaluated context export field
  };

  return (
    <WellnessContext.Provider value={value}>
      {children}
    </WellnessContext.Provider>
  );
};
