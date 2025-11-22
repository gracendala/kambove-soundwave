import { MockApiClient, isDemoMode } from './mockApi';

const API_BASE = '/api';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
      throw new Error(error.error || 'Erreur serveur');
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(username: string, email: string, password: string, role: string = 'operator') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
  }

  // Playlists
  async getPlaylists() {
    return this.request('/playlists');
  }

  async createPlaylist(name: string, description: string) {
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async deletePlaylist(id: number) {
    return this.request(`/playlists/${id}`, { method: 'DELETE' });
  }

  async getPlaylistSongs(id: number) {
    return this.request(`/playlists/${id}/songs`);
  }

  async addSongToPlaylist(playlistId: number, songId: number, position: number) {
    return this.request(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ songId, position }),
    });
  }

  // Schedule
  async getSchedule() {
    return this.request('/schedule');
  }

  async createScheduledEvent(data: any) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScheduledEvent(id: number, data: any) {
    return this.request(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteScheduledEvent(id: number) {
    return this.request(`/schedule/${id}`, { method: 'DELETE' });
  }

  // Upload
  async uploadAudio(file: File) {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur upload');
    }

    return response.json();
  }

  async getSongs() {
    return this.request('/upload/songs');
  }

  async deleteSong(id: number) {
    return this.request(`/upload/songs/${id}`, { method: 'DELETE' });
  }

  // Stats
  async recordPlay(songId: number, listenerCount: number) {
    return this.request('/stats/play', {
      method: 'POST',
      body: JSON.stringify({ songId, listenerCount }),
    });
  }

  async getStatsSummary() {
    return this.request('/stats/summary');
  }

  async getStatsHistory() {
    return this.request('/stats/history');
  }
}

// Utiliser le vrai client API pour production
export const api = new ApiClient();

// Pour mode démo: export const api = new MockApiClient() as unknown as ApiClient;
