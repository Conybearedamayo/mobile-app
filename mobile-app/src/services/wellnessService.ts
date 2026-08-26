import { API_BASE_URL } from '@/constants/apiConfig';

export const logMoodApi = async (token: string, mood: string, emoji: string, note?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/mood`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ mood, emoji, note }),
  });
  return response.json();
};

export const fetchMoodLogsApi = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/mood`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const logSleepApi = async (token: string, hours: number, quality: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/sleep`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ hours, quality }),
  });
  return response.json();
};

export const logActivityApi = async (token: string, type: string, duration: number) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ type, duration }),
  });
  return response.json();
};

export const saveJournalApi = async (token: string, content: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/journal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  return response.json();
};

export const updateJournalApi = async (token: string, id: string | number, content: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/journal/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  return response.json();
};

export const deleteJournalApi = async (token: string, id: string | number) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/journal/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const sendAiChatApi = async (message: string) => {
  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  return response.json();
};

export const fetchAllWellnessDataApi = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
