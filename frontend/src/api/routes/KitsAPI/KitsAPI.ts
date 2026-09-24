import axiosInstance from '../../axios/axiosInstance';
import { CreateKitPayload, KitSummary } from './types';

export const KitsAPI = {
  create: (data: CreateKitPayload): Promise<KitSummary> =>
    axiosInstance.post('/kits', data).then((r) => r.data),
  regenerateSection: (id: string, section: 'company_brief' | 'schedule' | 'category' | 'flashcards', payload?: any): Promise<{ kitData: any }> =>
    axiosInstance.post(`/kits/${id}/regenerate-section`, { section, payload }).then((r) => r.data),
  retry: (id: string, provider: string): Promise<{ message: string }> =>
    axiosInstance.post(`/kits/${id}/retry`, { provider }).then((r) => r.data),
  updateKitData: (id: string, kitData: any): Promise<{ message: string, kit: any }> =>
    axiosInstance.put(`/kits/${id}/data`, { kitData }).then((r) => r.data),
  
  // Granular update methods
  updateCompanyBrief: (id: string, company_brief: any): Promise<{ kit: any }> =>
    axiosInstance.patch(`/kits/${id}/company-brief`, { company_brief }).then((r) => r.data),
  updateRole: (id: string, role: any): Promise<{ kit: any }> =>
    axiosInstance.patch(`/kits/${id}/role`, { role }).then((r) => r.data),
  updateSchedule: (id: string, schedule: any): Promise<{ kit: any }> =>
    axiosInstance.patch(`/kits/${id}/schedule`, { schedule }).then((r) => r.data),
    
  createQuestion: (id: string, question: any): Promise<{ kit: any }> =>
    axiosInstance.post(`/kits/${id}/questions`, { question }).then((r) => r.data),
  updateQuestion: (id: string, questionId: string, question: any): Promise<{ kit: any }> =>
    axiosInstance.put(`/kits/${id}/questions/${questionId}`, { question }).then((r) => r.data),
  updateQuestionsArray: (id: string, questions: any[]): Promise<{ kit: any }> =>
    axiosInstance.put(`/kits/${id}/questions`, { questions }).then((r) => r.data),
  deleteQuestion: (id: string, questionId: string): Promise<{ kit: any }> =>
    axiosInstance.delete(`/kits/${id}/questions/${questionId}`).then((r) => r.data),
    
  createFlashcard: (id: string, flashcard: any): Promise<{ kit: any }> =>
    axiosInstance.post(`/kits/${id}/flashcards`, { flashcard }).then((r) => r.data),
  updateFlashcard: (id: string, flashcardId: string, flashcard: any): Promise<{ kit: any }> =>
    axiosInstance.put(`/kits/${id}/flashcards/${flashcardId}`, { flashcard }).then((r) => r.data),
  updateFlashcardsArray: (id: string, flashcards: any[]): Promise<{ kit: any }> =>
    axiosInstance.put(`/kits/${id}/flashcards`, { flashcards }).then((r) => r.data),
  deleteFlashcard: (id: string, flashcardId: string): Promise<{ kit: any }> =>
    axiosInstance.delete(`/kits/${id}/flashcards/${flashcardId}`).then((r) => r.data),
    
  deleteKit: (id: string): Promise<{ message: string }> =>
    axiosInstance.delete(`/kits/${id}`).then((r) => r.data),
};
