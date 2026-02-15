import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { API } from './App';

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] paper-texture flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 md:p-12 rounded-sm shadow-2xl border border-[#EFE6D5]">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-16 h-16 text-[#3E2723]" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl font-serif text-[#3E2723] text-center mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>

          <p className="text-center text-[#5D4037] mb-8">
            {isLogin ? 'Continue your writing journey' : 'Start your journaling adventure'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-[#3E2723] mb-2 font-serif">Name</label>
                <input
                  data-testid="name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 rounded-none focus:outline-none transition-colors font-serif"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-[#3E2723] mb-2 font-serif">Email</label>
              <input
                data-testid="email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 rounded-none focus:outline-none transition-colors font-serif"
                required
              />
            </div>

            <div>
              <label className="block text-[#3E2723] mb-2 font-serif">Password</label>
              <input
                data-testid="password-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 rounded-none focus:outline-none transition-colors font-serif"
                required
                minLength={6}
              />
            </div>

            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#3E2723] text-[#FDFBF7] px-8 py-3 rounded-full hover:bg-[#5D4037] transition-colors shadow-lg font-serif disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="toggle-auth-mode-btn"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#3E2723] hover:text-[#5D4037] font-serif underline decoration-1 underline-offset-4"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;