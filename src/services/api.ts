// Service API pour communiquer avec le backend Express
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper pour les requêtes authentifiées
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper pour gérer les erreurs
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Une erreur est survenue' }));
    throw new Error(error.error || error.message || 'Erreur serveur');
  }
  return response.json();
};

// Authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    // Le backend attend username, mais on peut utiliser email comme username
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  register: async (email: string, password: string, username?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username || email.split('@')[0],
        email,
        password,
        role: 'operator',
      }),
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        username: payload.username,
        roles: payload.roles || [],
      };
    } catch {
      return null;
    }
  },
};

// Playlists
export const playlistsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/playlists`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (name: string, description?: string) => {
    const response = await fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getSongs: async (id: string) => {
    const response = await fetch(`${API_URL}/playlists/${id}/songs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  addSong: async (playlistId: string, songId: string, position: number) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ songId, position }),
    });
    return handleResponse(response);
  },

  removeSong: async (playlistId: string, songId: string) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Songs
export const songsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/upload/songs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  upload: async (formData: FormData) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/upload/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Schedule
export const scheduleAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/schedule`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (event: any) => {
    const response = await fetch(`${API_URL}/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/schedule/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Stats
export const statsAPI = {
  getCurrent: async () => {
    const response = await fetch(`${API_URL}/stats/current`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getHistory: async () => {
    const response = await fetch(`${API_URL}/stats/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
