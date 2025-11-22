// Mock API pour tester l'interface avant déploiement backend
import { User, LoginResponse } from './api';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_URL;

// Mock data
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@kambove.radio', password: 'admin123', roles: ['admin'] },
  { id: 2, username: 'operator', email: 'operator@kambove.radio', password: 'operator123', roles: ['operator'] }
];

const mockPlaylists = [
  { id: 1, name: 'Louanges du Matin', description: 'Chants de louange pour commencer la journée', active: true, song_count: 15, total_duration: 3600, created_at: new Date().toISOString() },
  { id: 2, name: 'Prédications du Soir', description: 'Messages inspirants pour la soirée', active: true, song_count: 8, total_duration: 2400, created_at: new Date().toISOString() },
  { id: 3, name: 'Gospel Classique', description: 'Les grands classiques du gospel', active: false, song_count: 20, total_duration: 4800, created_at: new Date().toISOString() }
];

const mockSongs = [
  { id: 1, title: 'Amazing Grace', artist: 'Mahalia Jackson', album: 'Gospel Classics', duration: 240, file_path: '/uploads/amazing-grace.mp3', created_at: new Date().toISOString() },
  { id: 2, title: 'Oh Happy Day', artist: 'Edwin Hawkins', album: 'Best of Gospel', duration: 280, file_path: '/uploads/oh-happy-day.mp3', created_at: new Date().toISOString() },
  { id: 3, title: 'Alléluia', artist: 'Kambove Choir', album: 'Live 2024', duration: 320, file_path: '/uploads/alleluia.mp3', created_at: new Date().toISOString() }
];

const mockSchedule = [
  { id: 1, name: 'Prédication Matinale', song_id: 1, song_title: 'Message du Pasteur', artist: 'Pasteur Jean', scheduled_time: '06:00:00', days_of_week: [1, 2, 3, 4, 5], active: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Culte du Dimanche', song_id: 2, song_title: 'Service Dominical', artist: 'Chorale KT', scheduled_time: '10:00:00', days_of_week: [0], active: true, created_at: new Date().toISOString() }
];

const mockStats = {
  totalSongs: 45,
  playsLast24h: 387,
  currentListeners: 23,
  topSongs: [
    { title: 'Amazing Grace', artist: 'Mahalia Jackson', play_count: 45 },
    { title: 'Oh Happy Day', artist: 'Edwin Hawkins', play_count: 38 },
    { title: 'Alléluia', artist: 'Kambove Choir', play_count: 32 }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiClient {
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

  async login(username: string, password: string): Promise<LoginResponse> {
    await delay(500);
    
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Identifiants invalides');
    }

    const token = 'mock_token_' + Date.now();
    const userData: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles
    };

    this.setToken(token);
    
    return {
      token,
      user: userData
    };
  }

  async register(username: string, email: string, password: string, role: string = 'operator') {
    await delay(500);
    return { message: 'Utilisateur créé (mode démo)' };
  }

  async getPlaylists() {
    await delay(300);
    return mockPlaylists;
  }

  async createPlaylist(name: string, description: string) {
    await delay(400);
    const newPlaylist = {
      id: Date.now(),
      name,
      description,
      active: true,
      song_count: 0,
      total_duration: 0,
      created_at: new Date().toISOString()
    };
    mockPlaylists.push(newPlaylist);
    return newPlaylist;
  }

  async deletePlaylist(id: number) {
    await delay(300);
    const index = mockPlaylists.findIndex(p => p.id === id);
    if (index > -1) mockPlaylists.splice(index, 1);
    return { message: 'Playlist supprimée' };
  }

  async getPlaylistSongs(id: number) {
    await delay(300);
    return mockSongs.map((song, index) => ({ ...song, position: index }));
  }

  async addSongToPlaylist(playlistId: number, songId: number, position: number) {
    await delay(300);
    return { message: 'Chanson ajoutée' };
  }

  async getSchedule() {
    await delay(300);
    return mockSchedule;
  }

  async createScheduledEvent(data: any) {
    await delay(400);
    const newEvent = {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString()
    };
    mockSchedule.push(newEvent);
    return newEvent;
  }

  async updateScheduledEvent(id: number, data: any) {
    await delay(400);
    const index = mockSchedule.findIndex(s => s.id === id);
    if (index > -1) {
      mockSchedule[index] = { ...mockSchedule[index], ...data };
    }
    return mockSchedule[index];
  }

  async deleteScheduledEvent(id: number) {
    await delay(300);
    const index = mockSchedule.findIndex(s => s.id === id);
    if (index > -1) mockSchedule.splice(index, 1);
    return { message: 'Événement supprimé' };
  }

  async uploadAudio(file: File) {
    await delay(1500);
    const newSong = {
      id: Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: 'Artiste inconnu',
      album: '',
      duration: 240,
      file_path: `/uploads/${file.name}`,
      created_at: new Date().toISOString()
    };
    mockSongs.push(newSong);
    return newSong;
  }

  async getSongs() {
    await delay(300);
    return mockSongs;
  }

  async deleteSong(id: number) {
    await delay(300);
    const index = mockSongs.findIndex(s => s.id === id);
    if (index > -1) mockSongs.splice(index, 1);
    return { message: 'Chanson supprimée' };
  }

  async recordPlay(songId: number, listenerCount: number) {
    await delay(200);
    return { message: 'Statistique enregistrée' };
  }

  async getStatsSummary() {
    await delay(300);
    return mockStats;
  }

  async getStatsHistory() {
    await delay(300);
    const history = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      history.push({
        hour: hour.toISOString(),
        avg_listeners: Math.floor(Math.random() * 30) + 10
      });
    }
    return history;
  }
}

export const isDemoMode = () => DEMO_MODE;
