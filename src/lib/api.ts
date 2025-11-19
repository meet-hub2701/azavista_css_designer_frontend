import axios from 'axios';
import type { Theme, Section, WebsiteAnalysis, ThemeExportJSON } from '../../../shared/src/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const themeAPI = {
  getAll: () => api.get<Theme[]>('/themes'),
  getById: (id: string) => api.get<{ theme: Theme; sections: Section[] }>(`/themes/${id}`),
  create: (data: Partial<Theme>) => api.post<Theme>('/themes', data),
  createFromUrl: (data: { url: string; name?: string }) => 
    api.post<{ theme: Theme; sections: Section[]; analysis: any }>('/themes/from-url', data),
  update: (id: string, data: Partial<Theme>) => api.put<Theme>(`/themes/${id}`, data),
  delete: (id: string) => api.delete(`/themes/${id}`),
  duplicate: (id: string) => api.post<Theme>(`/themes/${id}/duplicate`),
  exportCSS: (id: string) => api.get(`/themes/${id}/export/css`, { responseType: 'blob' }),
  exportJSON: (id: string) => api.get<ThemeExportJSON>(`/themes/${id}/export/json`),
};

export const sectionAPI = {
  getByTheme: (themeId: string) => api.get<Section[]>(`/sections/theme/${themeId}`),
  getById: (id: string) => api.get<Section>(`/sections/${id}`),
  create: (themeId: string, data: Partial<Section>) => api.post<Section>(`/sections/theme/${themeId}`, data),
  update: (id: string, data: Partial<Section>) => api.put<Section>(`/sections/${id}`, data),
  delete: (id: string) => api.delete(`/sections/${id}`),
  updateOrder: (id: string, newOrder: number) => api.put(`/sections/${id}/order`, { newOrder }),
};

export const analysisAPI = {
  analyze: (url: string) => api.post<WebsiteAnalysis>('/analysis/analyze', { url }),
};

export default api;
