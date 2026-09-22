import axiosInstance from '../../axios/axiosInstance';
import { CreateKitPayload, KitSummary } from './types';

export const KitsAPI = {
  create: (data: CreateKitPayload): Promise<KitSummary> =>
    axiosInstance.post('/kits', data).then((r) => r.data),
  regenerateSection: (id: string, section: 'questions' | 'flashcards', items?: any[]): Promise<{ kitData: any }> =>
    axiosInstance.post(`/kits/${id}/regenerate-section`, { section, payload: { items } }).then((r) => r.data),
  retry: (id: string, provider: string): Promise<{ message: string }> =>
    axiosInstance.post(`/kits/${id}/retry`, { provider }).then((r) => r.data),
  updateKitData: (id: string, kitData: any): Promise<{ message: string, kit: any }> =>
    axiosInstance.put(`/kits/${id}/data`, { kitData }).then((r) => r.data),
  deleteKit: (id: string): Promise<{ message: string }> =>
    axiosInstance.delete(`/kits/${id}`).then((r) => r.data),
};
