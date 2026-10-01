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

export const updateMoodApi = async (token: string, id: string | number, mood: string, emoji: string, note?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/mood/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ mood, emoji, note }),
  });
  return response.json();
};

export const deleteMoodApi = async (token: string, id: string | number) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/mood/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const updateSleepApi = async (token: string, id: string | number, hours: number, quality: string) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/sleep/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ hours, quality }),
  });
  return response.json();
};

export const deleteSleepApi = async (token: string, id: string | number) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/sleep/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const updateActivityApi = async (token: string, id: string | number, type: string, duration: number) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/activity/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ type, duration }),
  });
  return response.json();
};

export const deleteActivityApi = async (token: string, id: string | number) => {
  const response = await fetch(`${API_BASE_URL}/api/wellness/activity/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

export const sendAiChatApi = async (message: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('AI API notice: server unreachable, using local engine.');
    return null;
  }
};

export const fetchAllWellnessDataApi = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wellness/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('Cloud sync notice: server unreachable, using cached offline data.');
    return null;
  }
};
