"use client";

import React from 'react';
import { ragAPI, AskResponse, WidgetSettings, SuggestedQuestion } from '@/lib/rag-api';
import { getWidgetTheme } from '@/components/landing/widgetTheme';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface AIChatbotWidgetProps {
  isEnabled: boolean;
}

export default function AIChatbotWidget({ isEnabled }: AIChatbotWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRagEnabled, setIsRagEnabled] = React.useState(false);
  const [settings, setSettings] = React.useState<WidgetSettings | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = React.useState<SuggestedQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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

  // Check if RAG is enabled on component mount
  React.useEffect(() => {
    const checkRagStatus = async () => {
      try {
        const enabled = await ragAPI.getToggle();
        setIsRagEnabled(enabled);
      } catch (error) {
        console.error('Failed to check RAG status:', error);
        setIsRagEnabled(false);
      }
    };

    const loadSuggestedQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const questions = await ragAPI.getSuggestedQuestions();
        setSuggestedQuestions(questions);
      } catch (error) {
        console.error('Failed to load suggested questions:', error);
        setSuggestedQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (isEnabled) {
      checkRagStatus();
      loadSuggestedQuestions();
      // Load widget settings
      ragAPI.getWidgetSettings().then(setSettings).catch(() => setSettings(null));
    }
  }, [isEnabled]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message when widget opens
  React.useEffect(() => {
    if (isOpen && messages.length === 0 && isRagEnabled) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'bot',
        content: '<p>Hello! I\'m here to help you learn about our POS system. Ask me anything or choose a question below.</p>',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, isRagEnabled]);

  const handleSuggestionClick = (question: string) => {
    if (isLoading || !isRagEnabled) return;
    setInputValue(question);
    // Automatically send the question
    setTimeout(() => {
      handleSendMessage(question);
    }, 0);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();

    // Validate input before sending
    if (!textToSend || isLoading || !isRagEnabled) return;

    // Validate minimum length
    if (textToSend.length < 3) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '<p>Please enter a question that is at least 3 characters long.</p>',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Validate maximum length
    if (textToSend.length > 1000) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '<p>Your question is too long. Please limit it to 1000 characters.</p>',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Validate for suspicious patterns
    const hasControlChars = /[\x00-\x08\x0E-\x1F\x7F]/.test(textToSend);
    const hasExcessiveRepeats = /(.)\1{100,}/.test(textToSend);

    if (hasControlChars || hasExcessiveRepeats) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '<p>Invalid characters detected. Please use only standard text.</p>',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: AskResponse = await ragAPI.askQuestion(textToSend);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      // Log detailed error to console for debugging (not exposed to user)
      console.error('Error sending message:', {
        error,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        stack: error?.stack,
      });

      // Always show user-friendly error messages - never expose technical details
      let errorContent = '<p>Sorry, I encountered an error while processing your question.</p><p>Please try again later. If the problem persists, please contact support.</p>';

      if (error?.response?.status === 503 || error?.response?.data?.error === 'ElasticsearchConnectionError') {
        // User-friendly message without technical details
        errorContent = '<p>I\'m temporarily inactive right now.</p><p>Please try again in a few moments. If the problem persists, please contact support.</p>';
      } else if (error?.response?.status === 500) {
        // Generic server error
        errorContent = '<p>I\'m experiencing some technical difficulties right now.</p><p>Please try again in a moment, or contact support if the issue continues.</p>';
      } else if (error?.response?.status === 404) {
        errorContent = '<p>The requested service was not found.</p><p>Please contact support if this issue persists.</p>';
      } else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        errorContent = '<p>The request took too long to process.</p><p>Please try again.</p>';
      }
      // Note: We intentionally ignore error.response.data.message to avoid exposing server internals

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render if RAG is disabled or widget is disabled
  if (!isEnabled || !isRagEnabled) {
    return null;
  }

  // Use shared theme computation (ensures parity with preview)
  const theme = getWidgetTheme(settings || undefined);
  const { right, launcherSize, borderRadius, chatWidth, chatHeight, primary, accent, shadow, primaryTextColor, accentTextColor } = theme;

  return (
    <div className={`fixed flex flex-col ${right ? 'items-end' : 'items-start'}`} style={{ bottom: 24, [right ? 'right' : 'left']: 24, zIndex: 9999 }}>
      {/* Chat Widget */}
      {isOpen && (
        <div
          className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300"
          style={{ width: chatWidth, height: chatHeight, borderRadius, boxShadow: shadow ? '0 10px 30px rgba(0,0,0,0.15)' : 'none' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
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
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${message.type === 'user'
                      ? ''
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  style={message.type === 'user' ? { backgroundColor: accent, color: accentTextColor } : {}}
                >
                  {message.type === 'bot' ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Suggested Questions - Only show when chat just started */}
            {messages.length <= 1 && !isLoading && !loadingQuestions && suggestedQuestions.length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((sq) => (
                    <button
                      key={sq._id}
                      onClick={() => handleSuggestionClick(sq.question)}
                      className="text-left px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {sq.question}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primary, color: primaryTextColor }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="transition-all duration-200 flex items-center justify-center hover:scale-105"
        style={{
          width: launcherSize,
          height: launcherSize,
          backgroundColor: primary,
          color: primaryTextColor,
          borderRadius: settings?.launcherShape === 'square' ? 12 : launcherSize / 2,
          boxShadow: shadow ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Custom CSS removed */}
    </div>
  );
}
