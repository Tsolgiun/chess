import { create } from 'zustand';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface GameState {
  activeGames: any[];
  availableGames: any[];
  currentGame: any | null;
  isLoading: boolean;
  error: string | null;
  fetchActiveGames: () => Promise<void>;
  fetchAvailableGames: () => Promise<void>;
  createGame: (timeControl: { initial: number; increment: number }) => Promise<string>;
  joinGame: (gameId: string) => Promise<void>;
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  error: null,

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('/auth/register', {
        username,
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, error: null });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Registration failed' });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, error: null });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Login failed' });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null, error: null });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/auth/me');
      set({ user: response.data, isLoading: false, error: null });
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, token: null, isLoading: false, error: null });
    }
  }
}));

// Game Store
export const useGameStore = create<GameState>((set) => ({
  activeGames: [],
  availableGames: [],
  currentGame: null,
  isLoading: false,
  error: null,

  fetchActiveGames: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get('/games/active');
      set({ activeGames: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch active games'
      });
    }
  },

  fetchAvailableGames: async () => {
    try {
      set({ isLoading: true });
      const response = await axios.get('/games/available');
      set({ availableGames: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch available games'
      });
    }
  },

  createGame: async (timeControl) => {
    try {
      set({ isLoading: true });
      const response = await axios.post('/games/create', timeControl);
      set({ isLoading: false, error: null });
      return response.data._id;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create game'
      });
      throw error;
    }
  },

  joinGame: async (gameId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`/games/${gameId}/join`);
      set({ isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to join game';
      set({
        isLoading: false,
        error: errorMessage
      });
      console.error('Error joining game:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}));

// Initialize auth state
useAuthStore.getState().checkAuth();
