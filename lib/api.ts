import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Import management
export const importApi = {
  triggerImport: () => 
    api.post('/imports/trigger'),
  
  getHistory: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
  }) => 
    api.get('/imports/history', { params }),
  
  getImportLogById: (id: string) => 
    api.get(`/imports/history/${id}`),
  
  getStats: (days: number = 7) => 
    api.get('/imports/stats', { params: { days } }),
};

// Queue management
export const queueApi = {
  getStats: () => 
    api.get('/imports/queue/stats'),
  
  pause: () => 
    api.post('/imports/queue/pause'),
  
  resume: () => 
    api.post('/imports/queue/resume'),
  
  retry: () => 
    api.post('/imports/queue/retry'),
  
  clean: (gracePeriod?: number) => 
    api.post('/imports/queue/clean', { gracePeriod }),
};

export default api; 