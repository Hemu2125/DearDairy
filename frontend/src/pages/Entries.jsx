import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { API } from './App';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

const Entries = ({ user }) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/entries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch entries');

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      toast.success('Entry deleted');
      setEntries(entries.filter(e => e.id !== entryId));
      setSelectedEntry(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSummarize = async (entry) => {
    setSummaryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: entry.content }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to summarize');

      setSummary(data.result);
      toast.success('Summary generated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] paper-texture">
      {/* Fixed Navigation */}
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center text-[#5D4037] text-xl">Loading your entries...</div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Calendar className="w-24 h-24 text-[#C5A059] mx-auto mb-6" />
            <h2 className="text-3xl font-serif text-[#3E2723] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>No Entries Yet</h2>
            <p className="text-[#5D4037] mb-6">Start your journaling journey today!</p>
            <button
              data-testid="start-writing-btn"
              onClick={() => navigate('/dashboard')}
              className="bg-[#3E2723] text-white px-8 py-3 rounded-full hover:bg-[#5D4037] transition-colors font-serif"
            >
              Start Writing
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Entries List */}
            <div className="lg:col-span-1 space-y-4">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    setSelectedEntry(entry);
                    setSummary('');
                  }}
                  className={`bg-white p-6 rounded-sm shadow-md border cursor-pointer transition-all ${
                    selectedEntry?.id === entry.id ? 'border-[#C5A059] border-2' : 'border-[#EFE6D5]'
                  }`}
                  data-testid={`entry-card-${entry.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg text-[#3E2723]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {entry.title}
                    </h3>
                    {entry.mood && (
                      <span className="text-sm bg-[#F5F5DC] px-3 py-1 rounded-full text-[#5D4037]">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8F9779] mb-2">
                    {format(new Date(entry.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-[#5D4037] text-sm line-clamp-3">
                    {entry.content}
                  </p>
                  <div className="mt-3 text-xs text-[#A1887F]">
                    {entry.word_count} words
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Entry Detail */}
            <div className="lg:col-span-2">
              {selectedEntry ? (
                <motion.div
                  key={selectedEntry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-sm shadow-2xl border border-[#EFE6D5] p-8 md:p-12 paper-texture"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-serif text-[#3E2723] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {selectedEntry.title}
                      </h2>
                      <p className="text-[#8F9779]">
                        {format(new Date(selectedEntry.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <button
                      data-testid="delete-entry-btn"
                      onClick={() => handleDelete(selectedEntry.id)}
                      className="text-[#B71C1C] hover:text-[#5D4037] transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  {selectedEntry.mood && (
                    <div className="mb-6">
                      <span className="bg-[#F5F5DC] px-4 py-2 rounded-full text-[#5D4037] font-serif">
                        Mood: {selectedEntry.mood}
                      </span>
                    </div>
                  )}

                  <div className="prose max-w-none mb-8">
                    <p className="text-lg text-[#2C2C2C] leading-loose whitespace-pre-wrap" style={{ fontFamily: 'Crimson Text, serif' }}>
                      {selectedEntry.content}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#EFE6D5]">
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        data-testid="summarize-entry-btn"
                        onClick={() => handleSummarize(selectedEntry)}
                        disabled={summaryLoading}
                        className="flex items-center gap-2 bg-[#C5A059] text-white px-6 py-3 rounded-full hover:bg-[#5D4037] transition-colors font-serif disabled:opacity-50"
                      >
                        <Sparkles className="w-5 h-5" />
                        {summaryLoading ? 'Summarizing...' : 'Summarize'}
                      </button>
                    </div>

                    {summary && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#F5F5DC] p-6 rounded-sm border-l-4 border-[#C5A059]"
                      >
                        <h4 className="font-serif text-lg text-[#3E2723] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Summary</h4>
                        <p className="text-[#5D4037] whitespace-pre-wrap">{summary}</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-6 text-sm text-[#A1887F]">
                    {selectedEntry.word_count} words • Created {format(new Date(selectedEntry.created_at), 'MMM dd, yyyy')}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-sm shadow-lg border border-[#EFE6D5] p-12 text-center">
                  <BookOpen className="w-16 h-16 text-[#C5A059] mx-auto mb-4" />
                  <p className="text-[#5D4037] text-lg">Select an entry to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Entries;