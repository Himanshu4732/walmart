/**
 * API service for HarvestIQ frontend
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  created_at: string;
}

export interface Farm {
  id: number;
  name: string;
  location: string;
  crop_type: string;
  area: number;
  owner_id: number;
  created_at: string;
}

export interface Prediction {
  id: number;
  farm_id: number;
  date: string;
  detected_count: number;
  predicted_kg: number;
  notes?: string;
  image_path?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: string;
}

export interface FarmCreate {
  name: string;
  location: string;
  crop_type: string;
  area: number;
}

export interface PredictionCreate {
  farm_id: number;
  detected_count: number;
  predicted_kg: number;
  notes?: string;
}

export interface UploadResponse {
  detected_count: number;
  predicted_kg: number;
  confidence: number;
  boxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  ripeness_analysis: {
    ripe: number;
    nearly_ripe: number;
    unripe: number;
    average_ripeness: number;
  };
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
};

// Farms API
export const farmsAPI = {
  getFarms: async (): Promise<Farm[]> => {
    const response = await api.get('/farms/');
    return response.data;
  },

  getFarm: async (farmId: number): Promise<Farm> => {
    const response = await api.get(`/farms/${farmId}`);
    return response.data;
  },

  createFarm: async (farmData: FarmCreate): Promise<Farm> => {
    const response = await api.post('/farms/', farmData);
    return response.data;
  },

  updateFarm: async (farmId: number, farmData: Partial<FarmCreate>): Promise<Farm> => {
    const response = await api.put(`/farms/${farmId}`, farmData);
    return response.data;
  },

  deleteFarm: async (farmId: number): Promise<void> => {
    await api.delete(`/farms/${farmId}`);
  },
};

// Predictions API
export const predictionsAPI = {
  getPredictions: async (): Promise<Prediction[]> => {
    const response = await api.get('/predictions/');
    return response.data;
  },

  getFarmPredictions: async (farmId: number): Promise<Prediction[]> => {
    const response = await api.get(`/predictions/farm/${farmId}`);
    return response.data;
  },

  getPrediction: async (predictionId: number): Promise<Prediction> => {
    const response = await api.get(`/predictions/${predictionId}`);
    return response.data;
  },

  createPrediction: async (predictionData: PredictionCreate): Promise<Prediction> => {
    const response = await api.post('/predictions/', predictionData);
    return response.data;
  },

  updatePrediction: async (predictionId: number, predictionData: Partial<PredictionCreate>): Promise<Prediction> => {
    const response = await api.put(`/predictions/${predictionId}`, predictionData);
    return response.data;
  },

  deletePrediction: async (predictionId: number): Promise<void> => {
    await api.delete(`/predictions/${predictionId}`);
  },

  uploadImage: async (farmId: number, file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/predictions/upload-stub?farm_id=${farmId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  chat: async (message: string): Promise<ChatResponse> => {
    const response = await api.post('/predictions/chat', null, {
      params: { message },
    });
    return response.data;
  },
};

export default api;