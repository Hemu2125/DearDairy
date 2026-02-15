import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Sparkles, Save, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { API } from './App';
import Navbar from '../components/Navbar';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const DRAFT_STORAGE_KEY = 'diary-entry-draft';
const AUTOSAVE_DELAY = 1000; // 5 seconds

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const textareaRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Add transcript to content
  useEffect(() => {
    if (transcript) {
      setContent(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  // Load draft
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setContent(draft.content || '');
        setTitle(draft.title || '');
        setMood(draft.mood || '');
        setLastSaved(new Date(draft.timestamp));
        toast.success('Draft restored');
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only auto-save if there's content
    if (content.trim() || title.trim() || mood.trim()) {
      autoSaveTimerRef.current = setTimeout(() => {
        const draft = {
          content,
          title,
          mood,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setLastSaved(new Date());
      }, AUTOSAVE_DELAY);
    } else {
      // Clear localStorage if all fields are empty
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setLastSaved(null);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, title, mood]);

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Voice not supported. Use Chrome, Edge, or Safari.');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
      toast.info('Recording stopped');
    } else {
      try {
        SpeechRecognition.startListening({ continuous: true });
        toast.success('🎤 Listening... Speak now', { duration: 1500 });
      } catch (error) {
        console.error('Start error:', error);
        toast.error('Could not start voice input. Check microphone permissions.');
      }
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || `Entry - ${new Date().toLocaleDateString()}`,
          content,
          mood,
        }),
      });

      if (!response.ok) throw new Error('Failed to save entry');
      toast.success('Entry saved successfully!');
      
      // Clear draft from localStorage after successful save
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setContent('');
      setTitle('');
      setMood('');
      setAiSuggestions('');
      setLastSaved(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImproveText = async () => {
    if (!content.trim()) {
      toast.error('Please write something first');
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/ai/improve-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to improve text');

      setContent(data.result);
      toast.success('Text improved!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!content.trim()) {
      toast.error('Please write something first');
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/ai/generate-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to generate suggestions');

      setAiSuggestions(data.result);
      toast.success('Suggestions generated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExtractTodos = async () => {
    if (!content.trim()) {
      toast.error('Please write something first');
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/ai/extract-todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to extract todos');

      toast.success('To-dos extracted! Check the To-dos page.');
      
      // Parse and save todos
      const todoLines = data.result.split('\n').filter(line => line.trim() && line.match(/^\d+\.\s+(.+)$/));
      
      for (const line of todoLines) {
        const match = line.match(/^\d+\.\s+(.+)$/);
        if (match) {
          const todoText = match[1].trim();
          await fetch(`${API}/todos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: todoText }),
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Helper to format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((new Date() - lastSaved) / 1000);
    if (seconds < 5) return 'Draft saved just now';
    if (seconds < 60) return `Draft saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Draft saved ${minutes}m ago`;
    return `Draft saved ${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] paper-texture">
      {/* Fixed Navigation */}
      <Navbar user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#3E2723] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome back, {user.name}
            </h1>
            <p className="text-[#5D4037] text-base sm:text-lg">What's on your mind today?</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Writing Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-sm shadow-2xl border border-[#EFE6D5] p-6 sm:p-8 md:p-12 paper-texture">
                <div className="mb-6">
                  <input
                    data-testid="entry-title-input"
                    type="text"
                    placeholder="Entry Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 sm:py-3 rounded-none focus:outline-none transition-colors text-xl sm:text-2xl font-serif text-[#3E2723]"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  />
                  {lastSaved && (
                    <p className="text-xs text-[#8F9779] mt-2 italic">
                      {getLastSavedText()}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <input
                    data-testid="entry-mood-input"
                    type="text"
                    placeholder="Mood (optional, e.g., Happy, Reflective)"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full bg-transparent border-b border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 rounded-none focus:outline-none transition-colors font-serif text-[#5D4037] text-sm sm:text-base"
                  />
                </div>

                <textarea
                  data-testid="entry-content-textarea"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear Diary,\n\nToday was..."
                  className="w-full bg-transparent border-none focus:ring-0 text-lg sm:text-xl leading-loose resize-none focus:outline-none diary-editor"
                  rows={15}
                />

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mt-6 pt-6 border-t border-[#EFE6D5]">
                  {browserSupportsSpeechRecognition ? (
                    <button
                      data-testid="voice-toggle-btn"
                      onClick={toggleListening}
                      disabled={aiLoading}
                      className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full font-serif transition-all shadow-md hover:shadow-lg active:scale-95 ${
                        listening
                          ? 'bg-red-600 text-white recording-pulse hover:bg-red-700'
                          : 'bg-gradient-to-r from-[#8F9779] to-[#6B7A5C] text-white hover:from-[#6B7A5C] hover:to-[#5D4037]'
                      } ${aiLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      {listening ? 'Stop Recording' : 'Voice Input'}
                    </button>
                  ) : (
                    <div className="text-xs text-[#A1887F] italic px-4 py-2 text-center sm:text-left">
                      Voice input not supported. Use Chrome, Edge, or Safari.
                    </div>
                  )}

                  <button
                    data-testid="improve-text-btn"
                    onClick={handleImproveText}
                    disabled={aiLoading || !content.trim()}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full font-serif transition-all shadow-md active:scale-95 bg-gradient-to-r from-[#C5A059] to-[#B8935A] text-white ${
                      aiLoading || !content.trim()
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:from-[#B8935A] hover:to-[#5D4037] hover:shadow-lg cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    {aiLoading ? 'Processing...' : 'Improve'}
                  </button>

                  <button
                    data-testid="extract-todos-btn"
                    onClick={handleExtractTodos}
                    disabled={aiLoading || !content.trim()}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full font-serif transition-all shadow-md active:scale-95 bg-gradient-to-r from-[#8F9779] to-[#6B7A5C] text-white ${
                      aiLoading || !content.trim()
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:from-[#6B7A5C] hover:to-[#5D4037] hover:shadow-lg cursor-pointer'
                    }`}
                  >
                    <ListTodo className="w-5 h-5" />
                    Extract To-dos
                  </button>

                  <button
                    data-testid="save-entry-btn"
                    onClick={handleSave}
                    disabled={saving || !content.trim()}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-8 py-3 rounded-full font-serif transition-all shadow-lg active:scale-95 bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white sm:ml-auto ${
                      saving || !content.trim()
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:from-[#5D4037] hover:to-[#3E2723] hover:shadow-xl cursor-pointer'
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Suggestions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#F5F5DC] rounded-sm shadow-lg border-2 border-[#C5A059] p-6 sticky top-24">
                <h3 className="text-xl font-serif text-[#3E2723] mb-4 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Sparkles className="w-6 h-6" />
                  AI Insights
                </h3>

                {aiSuggestions ? (
                  <div className="text-[#5D4037] whitespace-pre-wrap mb-4">{aiSuggestions}</div>
                ) : (
                  <p className="text-[#A1887F] italic mb-4">Write something and click the button below to get personalized suggestions!</p>
                )}

                <button
                  data-testid="generate-suggestions-btn"
                  onClick={handleGenerateSuggestions}
                  disabled={aiLoading}
                  className="w-full bg-[#3E2723] text-white px-6 py-3 rounded-full hover:bg-[#5D4037] transition-colors font-serif disabled:opacity-50"
                >
                  {aiLoading ? 'Generating...' : 'Get Suggestions'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;