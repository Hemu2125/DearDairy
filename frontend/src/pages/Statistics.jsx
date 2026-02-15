import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { API } from './App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const Statistics = ({ user }) => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('weekly');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/stats/${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'weekly':
        return 'Last 7 Days';
      case 'monthly':
        return 'Last 30 Days';
      case 'yearly':
        return 'Last 365 Days';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] paper-texture">
      {/* Fixed Navigation */}
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Period Selector */}
          <div className="flex gap-4 mb-8 flex-wrap">
            {['weekly', 'monthly', 'yearly'].map((p) => (
              <button
                key={p}
                data-testid={`period-${p}-btn`}
                onClick={() => setPeriod(p)}
                className={`px-6 py-3 rounded-full font-serif transition-all ${
                  period === p
                    ? 'bg-[#3E2723] text-white shadow-lg'
                    : 'bg-white text-[#3E2723] border border-[#3E2723] hover:bg-[#3E2723] hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-[#5D4037] text-xl">Loading statistics...</div>
          ) : stats ? (
            <div>
              <h2 className="text-3xl font-serif text-[#3E2723] mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                {getPeriodLabel()}
              </h2>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <StatCard
                  icon={<FileText className="w-12 h-12" strokeWidth={1.5} />}
                  title="Total Entries"
                  value={stats.entry_count}
                  color="#C5A059"
                />
                <StatCard
                  icon={<TrendingUp className="w-12 h-12" strokeWidth={1.5} />}
                  title="Total Words"
                  value={stats.total_words.toLocaleString()}
                  color="#8F9779"
                />
                <StatCard
                  icon={<Calendar className="w-12 h-12" strokeWidth={1.5} />}
                  title="Avg Words/Entry"
                  value={Math.round(stats.avg_words_per_entry)}
                  color="#A1887F"
                />
              </div>

              {/* Most Active Day */}
              {stats.most_active_day && (
                <div className="bg-white p-8 rounded-sm shadow-lg border border-[#EFE6D5] mb-12">
                  <h3 className="text-2xl font-serif text-[#3E2723] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Most Active Day
                  </h3>
                  <p className="text-[#5D4037] text-lg">{stats.most_active_day}</p>
                </div>
              )}

              {/* Insights */}
              <div className="bg-[#F5F5DC] p-8 rounded-sm shadow-lg border-2 border-[#C5A059]">
                <h3 className="text-2xl font-serif text-[#3E2723] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Insights
                </h3>
                <div className="space-y-3 text-[#5D4037]">
                  {stats.entry_count === 0 ? (
                    <p>Start writing to see your statistics!</p>
                  ) : (
                    <>
                      <p>• You've been consistently writing in your diary! Keep it up!</p>
                      {stats.avg_words_per_entry > 200 && (
                        <p>• Your entries are detailed and thoughtful. Great job expressing yourself!</p>
                      )}
                      {stats.entry_count > 10 && (
                        <p>• You're building a wonderful habit of journaling. This will serve as a precious record of your journey.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#5D4037]">No statistics available</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-sm shadow-lg border border-[#EFE6D5] hover:shadow-xl transition-all"
    >
      <div className="text-[#3E2723] mb-4">{icon}</div>
      <h3 className="text-lg text-[#5D4037] mb-2 font-serif">{title}</h3>
      <p className="text-4xl font-bold" style={{ color, fontFamily: 'Playfair Display, serif' }}>
        {value}
      </p>
    </motion.div>
  );
};

export default Statistics;