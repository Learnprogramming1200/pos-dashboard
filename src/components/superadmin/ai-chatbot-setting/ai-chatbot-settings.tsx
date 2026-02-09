"use client";

import React from 'react';
import { FaUpload, FaFile, FaFilePdf, FaFileWord, FaFileAlt, FaTrash, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaPaperPlane, FaRobot, FaUser, FaCog, FaRedo, FaTimes, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ragAPI, WidgetSettings, DetailedAIConfig, AIConfigUpdate, SuggestedQuestion } from '@/lib/rag-api';
import { WebComponents } from '@/components';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'paused' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function AIChatbotSettings() {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [aiConfig, setAiConfig] = React.useState<any>(null);
  const [ragEnabled, setRagEnabled] = React.useState<boolean | null>(null);
  const [ragToggleBusy, setRagToggleBusy] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [widgetSettings, setWidgetSettings] = React.useState<WidgetSettings | null>(null);
  const [savingWidget, setSavingWidget] = React.useState(false);
  const [widgetPreviewOpen, setWidgetPreviewOpen] = React.useState(true);
  const [widgetModalOpen, setWidgetModalOpen] = React.useState(false);
  const [detailedAIConfig, setDetailedAIConfig] = React.useState<DetailedAIConfig | null>(null);
  const [aiConfigOpen, setAiConfigOpen] = React.useState(false);
  const [suggestedQuestionsOpen, setSuggestedQuestionsOpen] = React.useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = React.useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<any | null>(null);
  const [newQuestion, setNewQuestion] = React.useState({ question: '', answer: '' });
  const [savingAIConfig, setSavingAIConfig] = React.useState(false);
  const [showApiKeys, setShowApiKeys] = React.useState({ openai: false, gemini: false });
  const [apiKeys, setApiKeys] = React.useState({ openai: '', gemini: '' });
  const [validatingKeys, setValidatingKeys] = React.useState({ openai: false, gemini: false });
  const [validationStatus, setValidationStatus] = React.useState<{ openai: boolean | null; gemini: boolean | null }>({ openai: null, gemini: null });
  const [availableModels, setAvailableModels] = React.useState<{
    openai: { chatModels: any[], embeddingModels: any[] } | null;
    gemini: { chatModels: any[], embeddingModels: any[] } | null;
  }>({ openai: null, gemini: null });
  const [fetchingModels, setFetchingModels] = React.useState({ openai: false, gemini: false });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Helper function to determine if a color is light or dark
  const isColorLight = (color: string): boolean => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return true if the color is light (luminance > 0.5)
    return luminance > 0.5;
  };

  // Check if at least one API key is configured
  const hasApiKeyConfigured = detailedAIConfig
    ? (detailedAIConfig.openai.apiKeyConfigured || detailedAIConfig.gemini.apiKeyConfigured)
    : false;

  // Fetch RAG toggle first, then conditionally fetch other data
  React.useEffect(() => {
    fetchRagToggle();
  }, []);

  // Fetch documents and config only when RAG is enabled
  React.useEffect(() => {
    if (ragEnabled === true) {
      fetchDocuments();
      fetchAIConfig();
      fetchDetailedAIConfig();
      fetchSuggestedQuestions();
      // Load widget settings
      ragAPI.getWidgetSettings().then(setWidgetSettings).catch(() => setWidgetSettings(null));
    } else if (ragEnabled === false) {
      // Clear data when disabled
      setUploadedFiles([]);
      setAiConfig(null);
      setIsLoading(false);
      setWidgetSettings(null);
      setSuggestedQuestions([]);
    }
  }, [ragEnabled]);

  // Scroll to bottom of chat
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Fetch AI configuration
  const fetchAIConfig = async () => {
    // Don't fetch if RAG is disabled
    if (ragEnabled === false) {
      setAiConfig(null);
      return;
    }

    try {
      const cfg = await ragAPI.getAIConfig();
      setAiConfig(cfg);
    } catch (error) {
      console.error('Error fetching AI config:', error);
    }
  };

  const fetchDetailedAIConfig = async () => {
    // Don't fetch if RAG is disabled
    if (ragEnabled === false) {
      setDetailedAIConfig(null);
      return;
    }

    try {
      const cfg = await ragAPI.getDetailedAIConfig();
      setDetailedAIConfig(cfg);
    } catch (error) {
      console.error('Failed to fetch detailed AI config:', error);
      toast.error('Failed to fetch detailed AI configuration');
    }
  };

  const fetchRagToggle = async () => {
    try {
      const enabled = await ragAPI.getToggle();
      setRagEnabled(enabled);
    } catch (e: any) {
      console.error('Failed to fetch RAG toggle:', e?.message || e);
      // Leave as null to avoid misleading UI
    }
  };

  // Fetch suggested questions
  const fetchSuggestedQuestions = async () => {
    if (ragEnabled === false) {
      setSuggestedQuestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const questions = await ragAPI.getSuggestedQuestionsAdmin();
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error('Error fetching suggested questions:', error);
      toast.error('Failed to load suggested questions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Seed default questions
  const handleSeedQuestions = async () => {
    try {
      setLoadingSuggestions(true);
      const questions = await ragAPI.seedDefaultSuggestedQuestions();
      setSuggestedQuestions(questions);
      toast.success('Default questions created successfully!');
    } catch (error: any) {
      console.error('Error seeding questions:', error);
      toast.error('Failed to create default questions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Add new question
  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    try {
      setLoadingSuggestions(true);
      const created = await ragAPI.createSuggestedQuestion(newQuestion);
      setSuggestedQuestions([...suggestedQuestions, created]);
      setNewQuestion({ question: '', answer: '' });
      toast.success('Question added successfully!');
    } catch (error: any) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Update question
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      setLoadingSuggestions(true);
      const updated = await ragAPI.updateSuggestedQuestion(editingQuestion._id, {
        question: editingQuestion.question,
        answer: editingQuestion.answer,
        isActive: editingQuestion.isActive,
      });
      setSuggestedQuestions(suggestedQuestions.map(q => q._id === updated._id ? updated : q));
      setEditingQuestion(null);
      toast.success('Question updated successfully!');
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      setLoadingSuggestions(true);
      await ragAPI.deleteSuggestedQuestion(id);
      setSuggestedQuestions(suggestedQuestions.filter(q => q._id !== id));
      toast.success('Question deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Toggle question active status
  const handleToggleActive = async (question: SuggestedQuestion) => {
    try {
      const updated = await ragAPI.updateSuggestedQuestion(question._id, {
        isActive: !question.isActive,
      });
      setSuggestedQuestions(suggestedQuestions.map(q => q._id === updated._id ? updated : q));
      toast.success(`Question ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error toggling question:', error);
      toast.error('Failed to toggle question');
    }
  };

  const handleToggleRag = async () => {
    if (ragEnabled === null || ragToggleBusy) return;
    try {
      setRagToggleBusy(true);
      const updated = await ragAPI.setToggle(!ragEnabled);
      setRagEnabled(updated);
      toast.success(`AI ${updated ? 'enabled' : 'disabled'}`);
    } catch (e: any) {
      console.error('Failed to update AI toggle:', e);
      toast.error('Failed to update AI toggle');
    } finally {
      setRagToggleBusy(false);
    }
  };

  const handleValidateAPIKey = async (provider: 'openai' | 'gemini') => {
    const apiKey = apiKeys[provider];
    const model = detailedAIConfig ? (provider === 'openai' ? detailedAIConfig.openai.chatModel : detailedAIConfig.gemini.chatModel) : undefined;

    if (!apiKey || !apiKey.trim()) {
      toast.warning(`Please enter a ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key first`);
      return;
    }

    try {
      setValidatingKeys({ ...validatingKeys, [provider]: true });
      setValidationStatus({ ...validationStatus, [provider]: null });

      const result = await ragAPI.validateAPIKey(provider, apiKey, model);

      setValidationStatus({ ...validationStatus, [provider]: result.valid });

      if (result.valid) {
        toast.success(`${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key is valid!`);

        // Fetch available models after successful validation
        try {
          setFetchingModels({ ...fetchingModels, [provider]: true });
          const models = await ragAPI.getAvailableModels(provider, apiKey);
          setAvailableModels({ ...availableModels, [provider]: models });
          toast.info(`Loaded ${models.chatModels.length} chat models and ${models.embeddingModels.length} embedding models`);
        } catch (e: any) {
          console.error('Failed to fetch models:', e);
          toast.warning('API key valid but failed to fetch available models');
        } finally {
          setFetchingModels({ ...fetchingModels, [provider]: false });
        }
      } else {
        toast.error(`Invalid API key: ${result.message}`);
      }
    } catch (e: any) {
      setValidationStatus({ ...validationStatus, [provider]: false });
      toast.error(e?.message || 'Failed to validate API key');
    } finally {
      setValidatingKeys({ ...validatingKeys, [provider]: false });
    }
  };

  const handleRemoveAPIKey = async (provider: 'openai' | 'gemini') => {
    if (!window.confirm(`Are you sure you want to remove the ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key?`)) {
      return;
    }

    try {
      await ragAPI.removeAPIKey(provider);

      // Clear the API key from state
      setApiKeys({ ...apiKeys, [provider]: '' });
      setValidationStatus({ ...validationStatus, [provider]: null });
      setAvailableModels({ ...availableModels, [provider]: null });

      // Update detailed config
      if (detailedAIConfig) {
        setDetailedAIConfig({
          ...detailedAIConfig,
          [provider]: {
            ...detailedAIConfig[provider],
            apiKeyConfigured: false,
          },
        });
      }

      toast.success(`${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key removed successfully`);

      // Refresh the detailed config
      fetchDetailedAIConfig();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove API key');
    }
  };

  const handleSaveAIConfig = async () => {
    if (!detailedAIConfig || savingAIConfig) return;

    try {
      setSavingAIConfig(true);

      const update: AIConfigUpdate = {
        provider: detailedAIConfig.provider,
        openai: {
          embeddingModel: detailedAIConfig.openai.embeddingModel,
          chatModel: detailedAIConfig.openai.chatModel,
        },
        gemini: {
          embeddingModel: detailedAIConfig.gemini.embeddingModel,
          chatModel: detailedAIConfig.gemini.chatModel,
        },
      };

      // Add API keys if provided
      if (apiKeys.openai) {
        update.openai!.apiKey = apiKeys.openai;
      }
      if (apiKeys.gemini) {
        update.gemini!.apiKey = apiKeys.gemini;
      }

      const updated = await ragAPI.updateAIConfig(update);
      setDetailedAIConfig(updated);

      // Clear API key inputs and validation status after saving
      setApiKeys({ openai: '', gemini: '' });
      setShowApiKeys({ openai: false, gemini: false });
      setValidationStatus({ openai: null, gemini: null });

      toast.success('AI configuration updated and validated successfully!');

      // Refresh AI config
      await fetchAIConfig();
      await fetchDetailedAIConfig();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update AI configuration');
    } finally {
      setSavingAIConfig(false);
    }
  };

  // Retry indexing a failed document
  const handleRetryIndexing = async (fileId: string) => {
    try {
      // Update UI immediately to show processing state
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'uploading' as const, progress: 50, errorMessage: undefined }
          : f
      ));

      await ragAPI.retryIndexing(fileId);
      toast.success('Retry indexing started. The document will be processed shortly.');

      // Start polling for status update
      const pollInterval = setInterval(async () => {
        try {
          const docs = await ragAPI.getDocuments();
          const updatedDoc = docs.find((doc: any) => doc.id === fileId);

          if (updatedDoc) {
            const status = updatedDoc.status === 'indexed' ? 'success' :
              updatedDoc.status === 'error' ? 'error' : 'uploading';
            const progress = updatedDoc.status === 'indexed' ? 100 :
              updatedDoc.status === 'error' ? 0 : 50;

            setUploadedFiles(prev => prev.map(f => {
              if (f.id === fileId) {
                const newStatus: 'uploading' | 'paused' | 'success' | 'error' = status as 'uploading' | 'paused' | 'success' | 'error';
                // Use the errorMessage from backend if available, otherwise use a default
                const errorMsg = updatedDoc.status === 'error'
                  ? ((updatedDoc as any).errorMessage || (updatedDoc as any).indexingStatus?.errorMessage || 'Indexing failed')
                  : undefined;
                return {
                  ...f,
                  id: updatedDoc.id,
                  status: newStatus,
                  progress,
                  errorMessage: errorMsg
                };
              }
              return f;
            }));

            // Stop polling if document is indexed or failed
            if (updatedDoc.status === 'indexed' || updatedDoc.status === 'error') {
              clearInterval(pollInterval);
              if (updatedDoc.status === 'indexed') {
                toast.success('Document indexed successfully!');
              }
            }
          }
        } catch (error) {
          console.error('Error polling document status:', error);
          clearInterval(pollInterval);
        }
      }, 2000); // Poll every 2 seconds

      // Clear interval after 5 minutes to prevent infinite polling
      setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
    } catch (error: any) {
      console.error('Error retrying indexing:', error);
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'error' as const, errorMessage: 'Failed to retry indexing' }
          : f
      ));
      toast.error('Failed to retry indexing');
    }
  };

  // Fetch uploaded documents
  const fetchDocuments = async () => {
    // Don't fetch if RAG is disabled
    if (ragEnabled === false) {
      setUploadedFiles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docs = await ragAPI.getDocuments();

      setUploadedFiles(docs.map((doc: any) => {
        const status = doc.status === 'indexed' ? 'success' :
          doc.status === 'error' ? 'error' :
            doc.status === 'processing' ? 'uploading' : 'uploading';
        const progress = doc.status === 'indexed' ? 100 :
          doc.status === 'error' ? 0 : 50;

        return {
          id: doc.id,
          name: doc.fileName,
          size: doc.fileSize,
          type: '',
          uploadedAt: new Date(doc.uploadedAt),
          status,
          progress,
          errorMessage: doc.status === 'error' && doc.indexingStatus?.errorMessage
            ? doc.indexingStatus.errorMessage
            : undefined,
        };
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  // Allowed file types (based on STANDALONE_README.md)
  const allowedTypes = ['.txt', '.pdf', '.doc', '.docx', '.json', '.csv'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FaFilePdf className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="w-6 h-6 text-blue-500" />;
      case 'txt':
        return <FaFileAlt className="w-6 h-6 text-gray-500" />;
      case 'json':
      case 'csv':
        return <FaFile className="w-6 h-6 text-green-500" />;
      default:
        return <FaFile className="w-6 h-6 text-gray-400" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const ext = '.' + file.name.toLowerCase().split('.').pop();

    if (!allowedTypes.includes(ext)) {
      return { valid: false, error: `File type ${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}` };
    }

    if (file.size > maxFileSize) {
      return { valid: false, error: `File size exceeds ${formatFileSize(maxFileSize)}` };
    }

    return { valid: true };
  };

  // Handle file upload with real API
  const controllersRef = React.useRef<Record<string, AbortController>>({});

  const uploadFile = async (file: File) => {
    // Don't upload if RAG is disabled
    if (ragEnabled === false) {
      toast.error('AI Assistant is disabled. Enable it first to upload documents.');
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newFile: UploadedFile = {
      id: tempId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0,
    };

    setUploadedFiles(prev => [newFile, ...prev]);

    // Real API call with progress tracking
    try {
      const { ragAPI } = await import('@/lib/rag-api');
      const controller = new AbortController();
      controllersRef.current[tempId] = controller;

      const result = await ragAPI.uploadDocument(file, (progress) => {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === tempId ? { ...f, progress } : f
          )
        );
      }, controller.signal);

      // Update with real ID from server and start indexing phase
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === tempId
            ? { ...f, id: result.id, progress: 50 }
            : f
        )
      );

      delete controllersRef.current[tempId];
      toast.success(`${file.name} uploaded successfully! Indexing in progress...`);

      // Start polling for indexing completion
      pollDocumentStatus(result.id, tempId);
    } catch (error: any) {
      delete controllersRef.current[tempId];

      // Check for timeout errors (Elasticsearch check might timeout)
      const isTimeoutError = error?.code === 'ECONNABORTED' ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('exceeded');

      // Check for Elasticsearch disabled error (503 or message contains Elastic Search)
      const isESDisabled = error?.response?.status === 503 ||
        error?.message?.includes('Elastic Search') ||
        error?.response?.data?.message?.includes('Elastic Search');

      // If Elasticsearch is disabled or timeout occurred (likely ES is down), remove file from list
      if (isESDisabled || isTimeoutError) {
        setUploadedFiles(prev => prev.filter(f => f.id !== tempId));
        const errorMsg = isESDisabled
          ? `Cannot upload ${file.name}: Elastic Search is disabled. Please enable Elasticsearch first.`
          : `Cannot upload ${file.name}: Elastic Search is not responding. Please check if Elasticsearch is running and try again.`;
        toast.error(errorMsg);
      } else {
        // For other errors, keep file in list with error status
        // Log detailed error to console for debugging
        console.error('Upload error details:', {
          fileName: file.name,
          error: error,
          response: error?.response,
          message: error?.message,
        });

        // Show user-friendly error message
        const userFriendlyMessage = 'Upload failed. Please check your file and try again.';
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === tempId
              ? { ...f, status: 'error', errorMessage: userFriendlyMessage }
              : f
          )
        );
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      }
    }
  };

  const handlePauseUpload = async (fileId: string) => {
    try {
      const controller = controllersRef.current[fileId];
      if (controller) {
        controller.abort();
        delete controllersRef.current[fileId];
      }
      setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'paused', errorMessage: 'Upload paused by user.' } : f));
      toast.success('Upload paused');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to pause upload');
    }
  };

  // Poll document status for real-time indexing updates
  const pollDocumentStatus = async (documentId: string, tempId: string) => {
    const maxAttempts = 30; // 30 attempts = 1 minute max
    let attempts = 0;

    const poll = async () => {
      try {
        const docs = await ragAPI.getDocuments();
        const doc = docs.find((d: any) => d.id === documentId);

        if (doc) {
          if (doc.status === 'indexed') {
            // Indexing complete
            setUploadedFiles(prev => {
              const updated = prev.map(f =>
                (f.id === tempId || f.id === documentId)
                  ? { ...f, id: documentId, status: 'success' as const, progress: 100 }
                  : f
              );
              return updated;
            });

            // Force refresh to ensure UI updates
            setRefreshKey(prev => prev + 1);

            toast.success('Document indexed successfully!');
            return;
          } else if (doc.status === 'error') {
            // Indexing failed
            // Use the errorMessage from backend if available
            const errorMsg = (doc as any).errorMessage || (doc as any).indexingStatus?.errorMessage || 'Indexing failed';
            setUploadedFiles(prev =>
              prev.map(f =>
                (f.id === tempId || f.id === documentId)
                  ? { ...f, id: documentId, status: 'error' as const, errorMessage: errorMsg }
                  : f
              )
            );
            toast.error(`Document indexing failed: ${errorMsg}`);
            return;
          } else {
            // Still indexing, update progress
            const currentProgress = 50 + (attempts * 2); // Gradually increase from 50% to 90%
            setUploadedFiles(prev =>
              prev.map(f =>
                (f.id === tempId || f.id === documentId)
                  ? { ...f, id: documentId, progress: Math.min(currentProgress, 90) }
                  : f
              )
            );
          }
        } else {
          // Document was likely cleaned up due to indexing failure
          setUploadedFiles(prev =>
            prev.filter(f => f.id !== tempId && f.id !== documentId)
          );
          toast.error('Document indexing failed and was removed');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          // Timeout - assume it's still processing
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === tempId
                ? { ...f, progress: 90 }
                : f
            )
          );
        }
      } catch (error) {
        console.error('Error polling document status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 1000);
  };

  // Handle file selection
  const handleFileSelect = React.useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const validation = validateFile(file);

      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      uploadFile(file);
    });
  }, []);

  // Handle drag and drop
  const handleDragEnter = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  // Handle click to upload
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle delete file with real API
  const handleDeleteFile = async (fileId: string) => {
    const fileToDelete = uploadedFiles.find(f => f.id === fileId);
    const isFailedDocument = fileToDelete?.status === 'error';
    const isUploading = fileToDelete?.status === 'uploading';

    // For uploading files, show cancel confirmation
    if (isUploading) {
      if (!window.confirm('Are you sure you want to cancel this upload? The file will be removed.')) {
        return;
      }
    }

    // Don't delete if RAG is disabled UNLESS it's a failed document (need to clean up)
    if (ragEnabled === false && !isFailedDocument && !isUploading) {
      toast.error('AI Assistant is disabled. Enable it first to manage documents.');
      return;
    }

    try {
      const { ragAPI } = await import('@/lib/rag-api');
      await ragAPI.deleteDocument(fileId);

      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success(isUploading ? 'Upload cancelled successfully' : 'File deleted successfully');
    } catch (error: any) {
      // Check if it's an Elasticsearch disabled error for non-failed documents
      if (error?.response?.status === 503 && !isFailedDocument && !isUploading) {
        toast.error('Cannot delete document - Elastic Search is disabled. Only failed documents can be deleted when Elasticsearch is disabled.');
      } else {
        toast.error(error?.response?.data?.message || error?.message || (isUploading ? 'Failed to cancel upload' : 'Failed to delete file'));
      }
    }
  };

  // Handle download document
  const handleDownloadDocument = async (fileId: string, fileName: string) => {
    try {
      const { ragAPI } = await import('@/lib/rag-api');
      await ragAPI.downloadDocument(fileId, fileName);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to download document');
    }
  };

  // Handle send message with real RAG API
  const handleSendMessage = async () => {
    // Validate input before sending
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage || isSending) return;

    // Validate minimum length
    if (trimmedMessage.length < 3) {
      toast.error('Question must be at least 3 characters long');
      return;
    }

    // Validate maximum length
    if (trimmedMessage.length > 1000) {
      toast.error('Question is too long. Please limit your question to 1000 characters.');
      return;
    }

    // Validate for suspicious patterns
    const hasControlChars = /[\x00-\x08\x0E-\x1F\x7F]/.test(trimmedMessage);
    const hasExcessiveRepeats = /(.)\1{100,}/.test(trimmedMessage);

    if (hasControlChars || hasExcessiveRepeats) {
      toast.error('Invalid characters detected. Please use only standard text.');
      return;
    }

    // If AI is disabled, do not send; notify instead
    if (ragEnabled === false) {
      toast.info('AI Assistant is disabled. Enable it to use chat.');
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    const question = trimmedMessage;
    setInputMessage('');
    setIsSending(true);

    // Real RAG API call
    try {
      const { ragAPI } = await import('@/lib/rag-api');

      // Get file IDs of successfully uploaded files
      const fileIds = uploadedFiles
        .filter(f => f.status === 'success')
        .map(f => f.id);

      const response = await ragAPI.askQuestion(question, fileIds.length > 0 ? fileIds : undefined);

      const botMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, botMessage]);

      // Show sources if available
      if (response.sources && response.sources.length > 0) {
      }

      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      // Log detailed error to console for debugging (not exposed to user)
      console.error('Error asking question:', {
        error,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        stack: error?.stack,
      });

      // Check if it's a service unavailable error (503)
      let errorContent = 'Sorry, I encountered an error while processing your question. Please try again later.';
      let toastMessage = 'Failed to get response';

      if (error?.response?.status === 503 || error?.response?.data?.error === 'ElasticsearchConnectionError') {
        // User-friendly message for Elasticsearch unavailable
        errorContent = 'The search service is currently unavailable. Please ensure Elasticsearch is running and try again.';
        toastMessage = 'Search service unavailable';
      } else if (error?.response?.status === 500) {
        // Generic server error message
        errorContent = 'I\'m experiencing technical difficulties right now. Please try again in a moment.';
        toastMessage = 'Server error - please try again';
      } else if (error?.response?.status === 404) {
        errorContent = 'The requested service was not found. Please contact support if this issue persists.';
        toastMessage = 'Service not found';
      } else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        errorContent = 'The request took too long to process. Please try again.';
        toastMessage = 'Request timeout';
      }

      toast.error(toastMessage);

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_bot`,
        type: 'bot',
        content: errorContent,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show disabled state when RAG is disabled
  if (ragEnabled === false) {
    return (
      <div className="h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Chatbot Settings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI Assistant is currently disabled
              </p>
            </div>
            <div className="flex items-center gap-3">
              {ragEnabled !== null && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Assistant
                  </span>
                  <button
                    onClick={handleToggleRag}
                    disabled={ragToggleBusy}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${ragEnabled
                      ? 'bg-green-600'
                      : 'bg-red-600'
                      } ${ragToggleBusy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={ragEnabled ? 'Disable AI' : 'Enable AI'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ragEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${ragEnabled
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {ragToggleBusy ? 'Updating...' : ragEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disabled State */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-12 text-center">
          <FaRobot className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AI Assistant is Disabled
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Enable the AI Assistant to upload documents, manage your knowledge base, and configure the chatbot settings.
          </p>
          <button
            onClick={handleToggleRag}
            disabled={ragToggleBusy}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {ragToggleBusy ? 'Enabling...' : 'Enable AI Assistant'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Chatbot Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upload and manage documents for the RAG-based AI chatbot
            </p>
          </div>
          <div className="flex items-center gap-3">
            {ragEnabled !== null && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Assistant
                </span>
                <button
                  onClick={handleToggleRag}
                  disabled={ragToggleBusy || !hasApiKeyConfigured}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${ragEnabled
                    ? 'bg-green-600'
                    : 'bg-red-600'
                    } ${(ragToggleBusy || !hasApiKeyConfigured) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={!hasApiKeyConfigured ? 'Configure an API key first' : (ragEnabled ? 'Disable AI' : 'Enable AI')}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ragEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className={`text-xs font-medium ${ragEnabled
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                  }`}>
                  {ragToggleBusy ? 'Updating...' : ragEnabled ? 'ON' : 'OFF'}
                </span>
                {!hasApiKeyConfigured && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    (API key required)
                  </span>
                )}
              </div>
            )}
            {aiConfig && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <FaCog className="text-blue-600 dark:text-blue-400" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">AI Provider: </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold capitalize">
                    {aiConfig.provider}
                  </span>
                  {!aiConfig.apiKeyConfigured && (
                    <span className="ml-2 text-xs text-red-600 dark:text-red-400">(API key not configured)</span>
                  )}
                </div>
              </div>
            )}
            {hasApiKeyConfigured && ragEnabled && (
              <button
                onClick={() => setWidgetModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                title="Configure and preview chatbot widget"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Widget Preview
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Configuration Section */}
      {ragEnabled && detailedAIConfig && (
        <div className="bg-white dark:bg-darkFilterbar shadow rounded-lg p-0 mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => setAiConfigOpen(!aiConfigOpen)}
            className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">AI Configuration</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Configure your AI provider, API keys, and models
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="text-sm font-medium">
                {aiConfigOpen ? 'Hide' : 'Show'} Configuration
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${aiConfigOpen ? 'rotate-180' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {aiConfigOpen && (
            <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Provider Selection */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  AI Provider
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDetailedAIConfig({ ...detailedAIConfig, provider: 'openai' })}
                    className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${detailedAIConfig.provider === 'openai'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">OpenAI</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      GPT-4, GPT-3.5, Ada embeddings
                    </div>
                  </button>
                  <button
                    onClick={() => setDetailedAIConfig({ ...detailedAIConfig, provider: 'gemini' })}
                    className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${detailedAIConfig.provider === 'gemini'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                  >
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">Google Gemini</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Gemini 1.5 Flash, text embeddings
                    </div>
                  </button>
                </div>
              </div>

              {/* OpenAI Configuration */}
              <div className={`space-y-4 p-4 rounded-lg border ${detailedAIConfig.provider === 'openai' ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 opacity-50'
                }`}>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  OpenAI Settings
                  {detailedAIConfig.openai.apiKeyConfigured && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      API Key Configured
                    </span>
                  )}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showApiKeys.openai ? 'text' : 'password'}
                        value={apiKeys.openai}
                        onChange={(e) => {
                          setApiKeys({ ...apiKeys, openai: e.target.value });
                          setValidationStatus({ ...validationStatus, openai: null });
                        }}
                        placeholder={detailedAIConfig.openai.apiKeyConfigured ? '••••••••••••••••' : 'Enter OpenAI API key'}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white pr-10"
                        disabled={detailedAIConfig.provider !== 'openai'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKeys({ ...showApiKeys, openai: !showApiKeys.openai })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={detailedAIConfig.provider !== 'openai'}
                      >
                        {showApiKeys.openai ? '👁️' : '🔒'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidateAPIKey('openai')}
                        disabled={!apiKeys.openai || validatingKeys.openai || detailedAIConfig.provider !== 'openai'}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                      >
                        {validatingKeys.openai ? (
                          <>
                            <FaSpinner className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="w-4 h-4" />
                            Verify Key
                          </>
                        )}
                      </button>
                      {detailedAIConfig.openai.apiKeyConfigured && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAPIKey('openai')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                        >
                          <FaTrash className="w-4 h-4" />
                          Remove Key
                        </button>
                      )}
                      {validationStatus.openai === true && (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <FaCheckCircle className="w-4 h-4" />
                          Valid ✓
                        </span>
                      )}
                      {validationStatus.openai === false && (
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                          <FaExclamationTriangle className="w-4 h-4" />
                          Invalid ✗
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="inline-flex items-center gap-2">
                      Embedding Model
                      <span className="relative group inline-block align-middle">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 8a1 1 0 012 0v1.5a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9a1 1 0 01-1-1v-2.5a1 1 0 011-1h1V8zM10 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                          Converts documents to searchable data
                        </div>
                      </span>
                    </span>
                  </label>
                  <select
                    value={detailedAIConfig.openai.embeddingModel}
                    onChange={(e) => setDetailedAIConfig({
                      ...detailedAIConfig,
                      openai: { ...detailedAIConfig.openai, embeddingModel: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white text-sm"
                    disabled={detailedAIConfig.provider !== 'openai'}
                  >
                    {availableModels.openai && availableModels.openai.embeddingModels.length > 0 ? (
                      availableModels.openai.embeddingModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="text-embedding-3-small">text-embedding-3-small - $0.02 per 1M tokens (Best Value)</option>
                        <option value="text-embedding-3-large">text-embedding-3-large - $0.13 per 1M tokens (Highest Quality)</option>
                        <option value="text-embedding-ada-002">text-embedding-ada-002 - $0.10 per 1M tokens (Legacy)</option>
                      </>
                    )}
                  </select>
                  {fetchingModels.openai && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <FaSpinner className="w-3 h-3 animate-spin" />
                      Loading available models...
                    </p>
                  )}
                  {!fetchingModels.openai && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Recommended: <strong>text-embedding-3-small</strong> offers best price-to-performance ratio
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="inline-flex items-center gap-2">
                      Chat Model
                      <span className="relative group inline-block align-middle">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 8a1 1 0 012 0v1.5a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9a1 1 0 01-1-1v-2.5a1 1 0 011-1h1V8zM10 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                          Generates answers to user questions
                        </div>
                      </span>
                    </span>
                  </label>
                  <select
                    value={detailedAIConfig.openai.chatModel}
                    onChange={(e) => setDetailedAIConfig({
                      ...detailedAIConfig,
                      openai: { ...detailedAIConfig.openai, chatModel: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white text-sm"
                    disabled={detailedAIConfig.provider !== 'openai'}
                  >
                    {availableModels.openai && availableModels.openai.chatModels.length > 0 ? (
                      availableModels.openai.chatModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="gpt-4o-mini">GPT-4o Mini - $0.15 per 1M tokens (Budget Friendly)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo - $0.50 per 1M tokens (Fast & Affordable)</option>
                        <option value="gpt-4o">GPT-4o - $2.50 per 1M tokens (Advanced & Fast)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo - $10 per 1M tokens (Very Powerful)</option>
                        <option value="gpt-4">GPT-4 - $30 per 1M tokens (Most Capable)</option>
                      </>
                    )}
                  </select>
                  {fetchingModels.openai && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <FaSpinner className="w-3 h-3 animate-spin" />
                      Loading available models...
                    </p>
                  )}
                  {!fetchingModels.openai && (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Recommended: <strong>gpt-4o-mini</strong> for cost-efficiency or <strong>gpt-4o</strong> for best quality
                      </p>
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-600 dark:text-gray-400">
                        <strong>Token Estimate:</strong> 1,000 tokens ≈ 750 words. Average chat response uses 200-500 tokens.
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gemini Configuration */}
              <div className={`space-y-4 p-4 rounded-lg border ${detailedAIConfig.provider === 'gemini' ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 opacity-50'
                }`}>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  Google Gemini Settings
                  {detailedAIConfig.gemini.apiKeyConfigured && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      API Key Configured
                    </span>
                  )}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showApiKeys.gemini ? 'text' : 'password'}
                        value={apiKeys.gemini}
                        onChange={(e) => {
                          setApiKeys({ ...apiKeys, gemini: e.target.value });
                          setValidationStatus({ ...validationStatus, gemini: null });
                        }}
                        placeholder={detailedAIConfig.gemini.apiKeyConfigured ? '••••••••••••••••' : 'Enter Gemini API key'}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white pr-10"
                        disabled={detailedAIConfig.provider !== 'gemini'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKeys({ ...showApiKeys, gemini: !showApiKeys.gemini })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={detailedAIConfig.provider !== 'gemini'}
                      >
                        {showApiKeys.gemini ? '👁️' : '🔒'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleValidateAPIKey('gemini')}
                        disabled={!apiKeys.gemini || validatingKeys.gemini || detailedAIConfig.provider !== 'gemini'}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                      >
                        {validatingKeys.gemini ? (
                          <>
                            <FaSpinner className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="w-4 h-4" />
                            Verify Key
                          </>
                        )}
                      </button>
                      {detailedAIConfig.gemini.apiKeyConfigured && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAPIKey('gemini')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                        >
                          <FaTrash className="w-4 h-4" />
                          Remove Key
                        </button>
                      )}
                      {validationStatus.gemini === true && (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <FaCheckCircle className="w-4 h-4" />
                          Valid ✓
                        </span>
                      )}
                      {validationStatus.gemini === false && (
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                          <FaExclamationTriangle className="w-4 h-4" />
                          Invalid ✗
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="inline-flex items-center gap-2">
                      Embedding Model
                      <span className="relative group inline-block align-middle">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 8a1 1 0 012 0v1.5a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9a1 1 0 01-1-1v-2.5a1 1 0 011-1h1V8zM10 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                          Converts documents to searchable data
                        </div>
                      </span>
                    </span>
                  </label>
                  <select
                    value={detailedAIConfig.gemini.embeddingModel}
                    onChange={(e) => setDetailedAIConfig({
                      ...detailedAIConfig,
                      gemini: { ...detailedAIConfig.gemini, embeddingModel: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white text-sm"
                    disabled={detailedAIConfig.provider !== 'gemini'}
                  >
                    {availableModels.gemini && availableModels.gemini.embeddingModels.length > 0 ? (
                      availableModels.gemini.embeddingModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="text-embedding-004">text-embedding-004 - FREE (Latest & Best)</option>
                        <option value="embedding-001">embedding-001 - FREE (Legacy)</option>
                      </>
                    )}
                  </select>
                  {fetchingModels.gemini && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <FaSpinner className="w-3 h-3 animate-spin" />
                      Loading available models...
                    </p>
                  )}
                  {!fetchingModels.gemini && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      <strong>text-embedding-004</strong> - Latest & most accurate for document indexing (100% FREE)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="inline-flex items-center gap-2">
                      Chat Model
                      <span className="relative group inline-block align-middle">
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 8a1 1 0 012 0v1.5a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9a1 1 0 01-1-1v-2.5a1 1 0 011-1h1V8zM10 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                          Generates answers to user questions
                        </div>
                      </span>
                    </span>
                  </label>
                  <select
                    value={detailedAIConfig.gemini.chatModel}
                    onChange={(e) => setDetailedAIConfig({
                      ...detailedAIConfig,
                      gemini: { ...detailedAIConfig.gemini, chatModel: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white text-sm"
                    disabled={detailedAIConfig.provider !== 'gemini'}
                  >
                    {availableModels.gemini && availableModels.gemini.chatModels.length > 0 ? (
                      availableModels.gemini.chatModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash - Best for Document Q&A (FREE)</option>
                        <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite - Most Cost-Effective (FREE)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash - Balanced & Reliable (FREE)</option>
                        <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite - Lightweight (FREE)</option>
                      </>
                    )}
                  </select>
                  {fetchingModels.gemini && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <FaSpinner className="w-3 h-3 animate-spin" />
                      Loading available models...
                    </p>
                  )}
                  {!fetchingModels.gemini && (
                    <div className="mt-1.5 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <p><strong>Model guide:</strong></p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li><strong>gemini-2.5-flash</strong>: Highest quality for RAG/document Q&A and deeper reasoning. Slightly higher latency than lite.</li>
                        <li><strong>gemini-2.5-flash-lite</strong>: Fastest and most cost‑effective. Ideal for FAQs, short answers, and high-traffic bots.</li>
                        <li><strong>gemini-2.0-flash</strong>: Balanced legacy option for general chat when 2.5 features aren't required.</li>
                        <li><strong>gemini-2.0-flash-lite</strong>: Lightweight for very simple prompts with minimal resource usage.</li>
                      </ul>
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        100% FREE usage with generous daily limits on Gemini — ideal for support chatbots.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Configuration Button */}
              <div className="col-span-full pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSaveAIConfig}
                  disabled={savingAIConfig}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingAIConfig ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      Saving Configuration...
                    </>
                  ) : (
                    <>
                      <FaCog className="w-5 h-5" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          {/* Help Section (removed to simplify collapsible layout) */}

        </div>
      )}

      {/* Suggested Questions Management Section */}
      {hasApiKeyConfigured && (
        <div className="bg-white dark:bg-darkFilterbar shadow rounded-lg p-0 mb-6 overflow-hidden">
          <button
            onClick={() => setSuggestedQuestionsOpen(!suggestedQuestionsOpen)}
            className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div> */}
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Suggested Questions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage quick-access questions shown in the chat widget
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${suggestedQuestionsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {suggestedQuestionsOpen && (
            <div className="p-6 space-y-6">
              {/* Header with Seed Button */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestedQuestions.length} {suggestedQuestions.length === 1 ? 'question' : 'questions'} configured
                  </p>
                </div>
                {suggestedQuestions.length === 0 && (
                  <button
                    onClick={handleSeedQuestions}
                    disabled={loadingSuggestions}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingSuggestions ? (
                      <><FaSpinner className="w-4 h-4 animate-spin" /> Creating...</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Create Default Questions
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Add New Question Form */}
              <div className="bg-gray-50 dark:bg-[#111111] rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Question
                </h3>
                <div className="space-y-3">
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>
                      Question
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                      type="text"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      placeholder="e.g., What is a POS system?"
                    />
                  </div>
                  <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel>
                      Answer
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.Textarea
                      value={newQuestion.answer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                      placeholder="Provide a clear, concise answer..."
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleAddQuestion}
                    disabled={loadingSuggestions || !newQuestion.question.trim() || !newQuestion.answer.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingSuggestions ? (
                      <><FaSpinner className="w-4 h-4 animate-spin" /> Adding...</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Question
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {loadingSuggestions && suggestedQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <FaSpinner className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading questions...</p>
                </div>
              ) : suggestedQuestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestedQuestions.sort((a, b) => a.order - b.order).map((sq) => (
                    <div
                      key={sq._id}
                      className={`border rounded-lg p-4 transition-all ${sq.isActive
                        ? 'border-[#F4F5F5] dark:border-[#616161] bg-white dark:bg-darkFilterbar'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50 opacity-60'
                        }`}
                    >
                      {editingQuestion?._id === sq._id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Question
                            </label>
                            <input
                              type="text"
                              value={editingQuestion.question}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Answer
                            </label>
                            <textarea
                              value={editingQuestion.answer}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateQuestion}
                              disabled={loadingSuggestions}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <FaCheckCircle className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingQuestion(null)}
                              disabled={loadingSuggestions}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-4 h-4 flex-shrink-0 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{sq.question}</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{sq.answer}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleActive(sq)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${sq.isActive
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                  }`}
                                title={sq.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {sq.isActive ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                onClick={() => setEditingQuestion(sq)}
                                className="p-2 bg-[#E8F0FF] dark:bg-[#3A3A3A] hover:bg-[#D7E6FF] dark:hover:bg-[#4A4A4A] text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(sq._id)}
                                disabled={loadingSuggestions}
                                className="p-2 bg-[#E8F0FF] dark:bg-[#3A3A3A] hover:bg-[#D7E6FF] dark:hover:bg-[#4A4A4A] text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No suggested questions yet.</p>
                  <p className="text-xs mt-1">Click "Create Default Questions" to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Three Column Layout - Documents and Chat */}
      {hasApiKeyConfigured ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - File Upload and Management */}
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="bg-white dark:bg-darkFilterbar shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Documents</h2>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                  }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drag and drop files here
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse from your computer
                </p>

                <button
                  onClick={handleClickUpload}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={allowedTypes.join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Supported formats: {allowedTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)}
                </p>
              </div>
            </div>

            {/* Uploaded Files List */}
            <div className="bg-white dark:bg-darkFilterbar shadow rounded-lg p-6 max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Uploaded Documents</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchDocuments}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Refresh document status"
                  >
                    Refresh
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FaFile className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Upload documents to train the AI chatbot
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={`${file.id}-${refreshKey}`}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* File Icon */}
                        <div className="flex-shrink-0">
                          {getFileIcon(file.name)}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </h3>

                            {/* Status Icon */}
                            {file.status === 'success' && (
                              <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                            {file.status === 'uploading' && (
                              <FaSpinner className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                            )}
                            {file.status === 'error' && (
                              <FaExclamationTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {file.uploadedAt.toLocaleString()}
                            </span>
                            {file.status === 'uploading' && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  {file.progress < 50 ? 'Uploading' :
                                    file.progress < 100 ? 'Indexing' : 'Complete'} ({file.progress}%)
                                </span>
                              </>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {file.status === 'uploading' && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {file.progress < 50 ? 'Uploading...' :
                                    file.progress < 100 ? 'Indexing...' : 'Complete'}
                                </span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  {file.progress}%
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {file.status === 'error' && file.errorMessage && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {file.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {file.status === 'uploading' ? (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Cancel upload"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        ) : file.status === 'error' ? (
                          <>
                            <button
                              onClick={() => handleRetryIndexing(file.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Retry indexing"
                            >
                              <FaRedo className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete file"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDownloadDocument(file.id, file.name)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Download document"
                            >
                              <FaDownload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete file"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat Interface & Widget Settings */}
          <div className="bg-white dark:bg-darkFilterbar shadow rounded-lg flex flex-col h-[calc(100vh-250px)]">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#F4F5F5] dark:border-[#616161]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <FaRobot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">AI Assistant Preview</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Test your chatbot here</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FaRobot className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Start a conversation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    Upload documents and ask questions to test the AI chatbot functionality
                  </p>
                </div>
              ) : (
                <>
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                        {message.type === 'user' ? (
                          <FaUser className="w-4 h-4 text-white" />
                        ) : (
                          <FaRobot className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2 rounded-lg max-w-[80%] ${message.type === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}>
                          {message.type === 'bot' ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: message.content }} />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#F4F5F5] dark:border-[#616161]">
              <div className="flex gap-2">
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about your documents..."
                  disabled={isSending || uploadedFiles.length === 0}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending || uploadedFiles.length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSending ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaPaperPlane className="w-4 h-4" />
                  )}
                </button>
              </div>
              {uploadedFiles.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Upload documents first to enable the chatbot
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-300 dark:border-red-700 p-8 text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
            API Key Required
          </h3>
          <p className="text-red-800 dark:text-red-200 mb-6 max-w-2xl mx-auto">
            To use the AI Chatbot, you must configure at least one AI provider (OpenAI or Gemini) with a valid API key.
            Please scroll up to the <strong>AI Configuration</strong> section and add your API key.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <FaCog className="w-4 h-4" />
            Configure API Key
          </button>
        </div>
      )}

      {/* Widget Settings Modal */}
      {widgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Widget Settings & Preview</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure and preview your AI chatbot widget</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    if (!widgetSettings) return;
                    try {
                      setSavingWidget(true);
                      const updated = await ragAPI.updateWidgetSettings(widgetSettings);
                      setWidgetSettings(updated);
                      toast.success('Widget settings saved');
                    } catch (e: any) {
                      toast.error(e?.message || 'Failed to save widget settings');
                    } finally {
                      setSavingWidget(false);
                    }
                  }}
                  disabled={!widgetSettings || savingWidget}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingWidget ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  onClick={() => setWidgetModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Column Layout */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left Column - Widget Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Widget Settings</h3>
                  {!widgetSettings ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading widget settings...</p>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Position</label>
                        <select
                          value={widgetSettings.position}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, position: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                        >
                          <option value="left">Bottom Left</option>
                          <option value="right">Bottom Right</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Primary Color</label>
                          <input
                            type="color"
                            value={widgetSettings.primaryColor}
                            onChange={(e) => setWidgetSettings({ ...widgetSettings, primaryColor: e.target.value })}
                            className="w-full h-10 p-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Accent Color</label>
                          <input
                            type="color"
                            value={widgetSettings.accentColor}
                            onChange={(e) => setWidgetSettings({ ...widgetSettings, accentColor: e.target.value })}
                            className="w-full h-10 p-1 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Launcher Shape</label>
                        <select
                          value={widgetSettings.launcherShape}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, launcherShape: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                        >
                          <option value="circle">Circle</option>
                          <option value="square">Square (Rounded)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Launcher Size</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={widgetSettings.launcherSize}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, launcherSize: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                            >
                              <option value={44}>Small (44)</option>
                              <option value={56}>Medium (56)</option>
                              <option value={64}>Large (64)</option>
                            </select>
                            <input
                              type="number"
                              value={widgetSettings.launcherSize}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, launcherSize: Number(e.target.value || 0) })}
                              className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                              min={40} max={96}
                              placeholder="Custom"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Border Radius</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={widgetSettings.borderRadius}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, borderRadius: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                            >
                              <option value={0}>None (0)</option>
                              <option value={8}>Small (8)</option>
                              <option value={12}>Medium (12)</option>
                              <option value={16}>Large (16)</option>
                            </select>
                            <input
                              type="number"
                              value={widgetSettings.borderRadius}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, borderRadius: Number(e.target.value || 0) })}
                              className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                              min={0} max={24}
                              placeholder="Custom"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Chat Width</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={widgetSettings.chatWidth}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, chatWidth: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                            >
                              <option value={300}>Compact (300)</option>
                              <option value={360}>Default (360)</option>
                              <option value={420}>Wide (420)</option>
                            </select>
                            <input
                              type="number"
                              value={widgetSettings.chatWidth}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, chatWidth: Number(e.target.value || 0) })}
                              className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                              min={280} max={480}
                              placeholder="Custom"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Chat Height</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={widgetSettings.chatHeight}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, chatHeight: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                            >
                              <option value={380}>Short (380)</option>
                              <option value={420}>Default (420)</option>
                              <option value={520}>Tall (520)</option>
                            </select>
                            <input
                              type="number"
                              value={widgetSettings.chatHeight}
                              onChange={(e) => setWidgetSettings({ ...widgetSettings, chatHeight: Number(e.target.value || 0) })}
                              className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800"
                              min={320} max={720}
                              placeholder="Custom"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Font Family removed */}

                      {/* Custom CSS removed */}
                    </div>
                  )}
                </div>

                {/* Right Column - Widget Live Preview */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 relative min-h-[600px]">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Preview</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">See changes in real-time</p>
                  </div>

                  {!widgetSettings ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-gray-400 dark:text-gray-600">Loading preview...</p>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-sm text-gray-300 dark:text-gray-700 font-medium">Preview Area</p>
                      </div>

                      {(() => {
                        // Use shared theme computation
                        const { right, launcherSize, borderRadius, chatWidth, chatHeight, primary, accent, shadow, primaryTextColor, accentTextColor } = (require('@/components/landing/widgetTheme') as any).getWidgetTheme(widgetSettings);
                        return (
                          <div className={`absolute flex flex-col ${right ? 'items-end' : 'items-start'}`} style={{ bottom: 24, [right ? 'right' : 'left']: 24, zIndex: 10 }}>
                            {widgetPreviewOpen && (
                              <div
                                className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300"
                                style={{
                                  width: chatWidth,
                                  height: chatHeight,
                                  borderRadius,
                                  boxShadow: shadow ? '0 10px 30px rgba(0,0,0,0.15)' : 'none'
                                }}
                              >
                                <div className="flex items-center justify-between p-4 border-b border-[#F4F5F5] dark:border-[#616161]">
                                  <div className="flex items-center space-x-2">
                                    <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: primary }}>
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: primaryTextColor }}>
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                                    </div>
                                  </div>
                                  <button onClick={() => setWidgetPreviewOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/30">
                                  <div className="flex justify-start">
                                    <div className="max-w-[80%] px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm">
                                      <p className="text-sm">Hello! I'm here to help you learn about our POS system. Ask me anything or choose a question below.</p>
                                    </div>
                                  </div>

                                  {/* Suggested Questions Preview */}
                                  <div className="space-y-3 mt-4">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                      Suggested Questions
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {["What is a POS system?", "What are the key features?", "What payment methods are supported?"].map((q, i) => (
                                        <div
                                          key={i}
                                          className="text-left px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                                        >
                                          <span className="inline-flex items-center gap-2">
                                            <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {q}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex justify-end">
                                    <div className="max-w-[80%] px-3 py-2 rounded-lg shadow-sm" style={{ backgroundColor: accent, color: accentTextColor }}>
                                      <p className="text-sm">What is a POS system?</p>
                                    </div>
                                  </div>
                                  <div className="flex justify-start">
                                    <div className="max-w-[80%] px-3 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm">
                                      <p className="text-sm">A POS system is software used to process sales transactions and manage business operations.</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex space-x-2">
                                    <input type="text" placeholder="Type your message..." className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled />
                                    <button className="px-4 py-2 rounded-lg" style={{ backgroundColor: primary, color: primaryTextColor }}>
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => setWidgetPreviewOpen(!widgetPreviewOpen)}
                              className="transition-all duration-200 flex items-center justify-center hover:scale-105"
                              style={{
                                width: launcherSize,
                                height: launcherSize,
                                backgroundColor: primary,
                                color: primaryTextColor,
                                borderRadius: widgetSettings.launcherShape === 'square' ? 12 : launcherSize / 2,
                                boxShadow: shadow ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
                              }}
                            >
                              {widgetPreviewOpen ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
