import api from '@/lib/api';

export interface AIConfig {
  provider: 'openai' | 'gemini';
  models: {
    embedding: string;
    chat: string;
  };
  apiKeyConfigured: boolean;
  elasticsearchUrl: string;
}

export interface DetailedAIConfig {
  provider: 'openai' | 'gemini';
  openai: {
    embeddingModel: string;
    chatModel: string;
    apiKeyConfigured: boolean;
  };
  gemini: {
    embeddingModel: string;
    chatModel: string;
    apiKeyConfigured: boolean;
  };
}

export interface AIConfigUpdate {
  provider: 'openai' | 'gemini';
  openai?: {
    apiKey?: string;
    embeddingModel?: string;
    chatModel?: string;
  };
  gemini?: {
    apiKey?: string;
    embeddingModel?: string;
    chatModel?: string;
  };
}

export interface RagDocument {
  id: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
  isIndexed: boolean;
  chunkCount: number;
  uploadedAt: string;
  errorMessage?: string;
  indexingStatus?: {
    errorMessage?: string;
    isIndexed?: boolean;
    chunkCount?: number;
  };
}

export interface AskResponse {
  answer: string;
  sources: {
    fileName: string;
    content: string;
    score: number;
  }[];
}

export interface WidgetSettings {
  position: 'left' | 'right';
  primaryColor: string;
  accentColor: string;
  launcherShape: 'circle' | 'square';
  launcherSize: number;
  chatWidth: number;
  chatHeight: number;
  borderRadius: number;
  shadow: boolean;
  fontFamily: string;
  zIndex: number;
  customCss: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
}

export interface AvailableModels {
  chatModels: ModelInfo[];
  embeddingModels: ModelInfo[];
}

export interface SuggestedQuestion {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedQuestionCreate {
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

export interface SuggestedQuestionUpdate {
  question?: string;
  answer?: string;
  order?: number;
  isActive?: boolean;
}

class RagAPI {
  /**
   * Get AI configuration
   */
  async getAIConfig(): Promise<AIConfig> {
    const { data } = await api.get('/rag/config', { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch AI config');
    }
    return data.data as AIConfig;
  }

  /**
   * Get all uploaded documents
   */
  async getDocuments(): Promise<RagDocument[]> {
    const { data } = await api.get('/rag/documents', { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch documents');
    }
    return data.data as RagDocument[];
  }

  /**
   * Upload a document
   */
  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<RagDocument> {
    const formData = new FormData();
    formData.append('ragDocument', file);

    const { data } = await api.post('/rag/upload', formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      },
      signal,
    });

    if (!data?.success) {
      throw new Error(data?.message || 'Upload failed');
    }
    return data.data as RagDocument;
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    const { data } = await api.delete(`/rag/documents/${id}`, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to delete document');
    }
  }

  /**
   * Download a document
   */
  async downloadDocument(id: string, fileName: string): Promise<void> {
    try {
      // Try to get response - if it's Cloudinary, it will be JSON; if local, it will be a blob
      // First attempt with JSON response type to check for Cloudinary
      let checkResponse;
      try {
        checkResponse = await api.get(`/rag/documents/${id}/download`, {
          withCredentials: true,
        });
        
        // If it's a Cloudinary URL, handle it differently
        if (checkResponse.data?.success && checkResponse.data?.isCloudinary) {
          const fileUrl = checkResponse.data.url;
          // Use the original filename from backend response, fallback to provided fileName
          const originalFileName = checkResponse.data.fileName || fileName;
          
          // For Cloudinary files, fetch as blob to ensure proper download with filename
          try {
            const blobResponse = await fetch(fileUrl);
            const blob = await blobResponse.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Download the file with original filename
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          } catch (fetchError) {
            // Fallback: try direct download link
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', originalFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
          return;
        }
      } catch (jsonError: any) {
        // If JSON parsing fails, it might be a blob response (local file)
        // Continue to fetch as blob
      }

      // For local files, fetch as blob
      const response = await api.get(`/rag/documents/${id}/download`, {
        withCredentials: true,
        responseType: 'blob',
      });
      
      // response.data is already a Blob when responseType is 'blob'
      const url = window.URL.createObjectURL(response.data);
      
      // Always download the file with original filename
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      // If error response is a blob, try to parse it as JSON
      if (error?.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData?.message || 'Failed to download document');
        } catch {
          throw new Error('Failed to download document');
        }
      }
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to download document');
    }
  }

  /**
   * Ask a question
   */
  async askQuestion(question: string, fileIds?: string[]): Promise<AskResponse> {
    const { data } = await api.post(
      '/rag/ask',
      { question, fileIds },
      { withCredentials: true }
    );
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to get answer');
    }
    return data.data as AskResponse;
  }

  /**
   * RAG toggle (backend feature flag)
   */
  async getToggle(): Promise<boolean> {
    const { data } = await api.get('/rag/toggle', { withCredentials: true });
    if (data?.enabled === undefined) {
      throw new Error('Failed to fetch RAG toggle');
    }
    return !!data.enabled;
  }

  async setToggle(enabled: boolean): Promise<boolean> {
    const { data } = await api.patch(
      '/rag/toggle',
      { enabled },
      { withCredentials: true }
    );
    if (data?.enabled === undefined) {
      throw new Error('Failed to update RAG toggle');
    }
    return !!data.enabled;
  }

  /**
   * Widget settings
   */
  async getWidgetSettings(): Promise<WidgetSettings> {
    const { data } = await api.get('/rag/widget');
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch widget settings');
    return data.data as WidgetSettings;
  }

  async updateWidgetSettings(payload: Partial<WidgetSettings>): Promise<WidgetSettings> {
    const { data } = await api.put('/rag/widget', payload, { withCredentials: true });
    if (!data?.success) throw new Error(data?.message || 'Failed to update widget settings');
    return data.data as WidgetSettings;
  }

  /**
   * Get failed documents
   */
  async getFailedDocuments(): Promise<RagDocument[]> {
    const { data } = await api.get('/rag/documents/failed', { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch failed documents');
    }
    return data.data as RagDocument[];
  }

  /**
   * Retry indexing a failed document
   */
  async retryIndexing(id: string): Promise<RagDocument> {
    const { data } = await api.post(`/rag/documents/${id}/retry`, {}, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to retry indexing');
    }
    return data.data as RagDocument;
  }

  /**
   * Get detailed AI configuration (superadmin only)
   */
  async getDetailedAIConfig(): Promise<DetailedAIConfig> {
    const { data } = await api.get('/rag/config/detailed', { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch detailed AI config');
    }
    return data.data as DetailedAIConfig;
  }

  /**
   * Validate API key (superadmin only)
   */
  async validateAPIKey(provider: 'openai' | 'gemini', apiKey: string, model?: string): Promise<{ valid: boolean; message: string }> {
    const { data } = await api.post('/rag/config/validate', { provider, apiKey, model }, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to validate API key');
    }
    return { valid: data.valid, message: data.message };
  }

  /**
   * Update AI configuration (superadmin only)
   */
  async updateAIConfig(config: AIConfigUpdate): Promise<DetailedAIConfig> {
    const { data } = await api.put('/rag/config', config, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to update AI config');
    }
    return data.data as DetailedAIConfig;
  }

  /**
   * Remove API key for a provider (superadmin only)
   */
  async removeAPIKey(provider: 'openai' | 'gemini'): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/rag/config/remove-key', { provider }, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to remove API key');
    }
    return { success: true, message: data.message };
  }

  /**
   * Get available models for a provider (superadmin only)
   */
  async getAvailableModels(provider: 'openai' | 'gemini', apiKey: string): Promise<AvailableModels> {
    const { data } = await api.post('/rag/config/models', { provider, apiKey }, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch available models');
    }
    return data.data as AvailableModels;
  }

  /**
   * Get suggested questions (public for widget)
   */
  async getSuggestedQuestions(): Promise<SuggestedQuestion[]> {
    const { data } = await api.get('/rag/suggested-questions');
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch suggested questions');
    }
    return data.data as SuggestedQuestion[];
  }

  /**
   * Get all suggested questions (admin only, includes inactive)
   */
  async getSuggestedQuestionsAdmin(): Promise<SuggestedQuestion[]> {
    const { data } = await api.get('/rag/suggested-questions/admin', { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to fetch suggested questions');
    }
    return data.data as SuggestedQuestion[];
  }

  /**
   * Create a new suggested question (admin only)
   */
  async createSuggestedQuestion(question: SuggestedQuestionCreate): Promise<SuggestedQuestion> {
    const { data } = await api.post('/rag/suggested-questions', question, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to create suggested question');
    }
    return data.data as SuggestedQuestion;
  }

  /**
   * Update a suggested question (admin only)
   */
  async updateSuggestedQuestion(id: string, updates: SuggestedQuestionUpdate): Promise<SuggestedQuestion> {
    const { data } = await api.put(`/rag/suggested-questions/${id}`, updates, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to update suggested question');
    }
    return data.data as SuggestedQuestion;
  }

  /**
   * Delete a suggested question (admin only)
   */
  async deleteSuggestedQuestion(id: string): Promise<void> {
    const { data } = await api.delete(`/rag/suggested-questions/${id}`, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to delete suggested question');
    }
  }

  /**
   * Reorder suggested questions (admin only)
   */
  async reorderSuggestedQuestions(questions: { id: string; order: number }[]): Promise<void> {
    const { data} = await api.post('/rag/suggested-questions/reorder', { questions }, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to reorder questions');
    }
  }

  /**
   * Seed default suggested questions (admin only)
   */
  async seedDefaultSuggestedQuestions(): Promise<SuggestedQuestion[]> {
    const { data } = await api.post('/rag/suggested-questions/seed', {}, { withCredentials: true });
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to seed default questions');
    }
    return data.data as SuggestedQuestion[];
  }
}

export const ragAPI = new RagAPI();
