import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Sparkles, TrendingUp, Calendar } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] paper-texture">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#C5A059] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8F9779] rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <BookOpen className="w-24 h-24 text-[#3E2723]" strokeWidth={1.5} />
            </div>

            <h1 className="text-5xl md:text-7xl font-serif text-[#3E2723] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              DearDiary
            </h1>

            <p className="text-xl md:text-2xl text-[#5D4037] mb-4 max-w-3xl mx-auto" style={{ fontFamily: 'Crimson Text, serif' }}>
              Your Personal Journal, Reimagined
            </p>

            <p className="text-lg text-[#8F9779] mb-12 max-w-2xl mx-auto">
              Write, reflect, and grow with AI-powered insights. Experience the warmth of a vintage diary with the intelligence of modern technology.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                data-testid="get-started-btn"
                onClick={() => navigate('/auth')}
                className="bg-[#3E2723] text-[#FDFBF7] px-10 py-4 rounded-full hover:bg-[#5D4037] transition-all shadow-lg font-serif text-lg"
              >
                Start Writing
              </button>
              <button
                data-testid="learn-more-btn"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-[#3E2723] text-[#3E2723] px-10 py-4 rounded-full hover:bg-[#3E2723] hover:text-[#FDFBF7] transition-all font-serif text-lg"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-[#3E2723] text-center mb-16" style={{ fontFamily: 'Playfair Display, serif' }}>
              Features That Inspire
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Mic className="w-12 h-12" strokeWidth={1.5} />}
                title="Voice to Text"
                description="Speak your thoughts and watch them transform into beautifully written entries."
              />
              <FeatureCard
                icon={<Sparkles className="w-12 h-12" strokeWidth={1.5} />}
                title="AI Insights"
                description="Get intelligent suggestions, summaries, and English improvements for your entries."
              />
              <FeatureCard
                icon={<TrendingUp className="w-12 h-12" strokeWidth={1.5} />}
                title="Growth Tracking"
                description="Visualize your writing journey with weekly, monthly, and yearly statistics."
              />
              <FeatureCard
                icon={<Calendar className="w-12 h-12" strokeWidth={1.5} />}
                title="Smart Reminders"
                description="Never miss a moment with AI-generated to-dos and thoughtful reminders."
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-[#F5F5DC] paper-texture">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#3E2723] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Begin Your Journey Today
          </h2>
          <p className="text-xl text-[#5D4037] mb-8">
            Join thousands who have discovered the joy of mindful journaling.
          </p>
          <button
            data-testid="cta-get-started-btn"
            onClick={() => navigate('/auth')}
            className="bg-[#3E2723] text-[#FDFBF7] px-12 py-4 rounded-full hover:bg-[#5D4037] transition-all shadow-lg font-serif text-lg"
          >
            Get Started Free
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-[#5D4037]">
        <p className="text-sm">© 2025 DearDiary. Crafted with care for mindful writers.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-sm shadow-md border border-[#EFE6D5] hover:shadow-xl transition-all"
    >
      <div className="text-[#3E2723] mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#3E2723] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
        {title}
      </h3>
      <p className="text-[#5D4037]">{description}</p>
    </motion.div>
  );
};

export default Landing;