import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, BarChart3, CheckSquare, LogOut, Home, Menu, X } from 'lucide-react';

const Navbar = ({ user, showBackToDashboard = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-[#EFE6D5] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#3E2723]" strokeWidth={1.5} />
            <span className="text-xl sm:text-2xl font-serif text-[#3E2723]" style={{ fontFamily: 'Playfair Display, serif' }}>
              DearDiary
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button
              data-testid="nav-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              className={`font-serif flex items-center gap-2 transition-colors text-sm lg:text-base ${
                isActive('/dashboard')
                  ? 'text-[#C5A059] font-semibold'
                  : 'text-[#3E2723] hover:text-[#5D4037]'
              }`}
            >
              <Home className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Home</span>
            </button>
            <button
              data-testid="nav-entries-btn"
              onClick={() => navigate('/entries')}
              className={`font-serif flex items-center gap-2 transition-colors text-sm lg:text-base ${
                isActive('/entries')
                  ? 'text-[#C5A059] font-semibold'
                  : 'text-[#3E2723] hover:text-[#5D4037]'
              }`}
            >
              <BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Entries</span>
            </button>
            <button
              data-testid="nav-stats-btn"
              onClick={() => navigate('/statistics')}
              className={`font-serif flex items-center gap-2 transition-colors text-sm lg:text-base ${
                isActive('/statistics')
                  ? 'text-[#C5A059] font-semibold'
                  : 'text-[#3E2723] hover:text-[#5D4037]'
              }`}
            >
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Stats</span>
            </button>
            <button
              data-testid="nav-todos-btn"
              onClick={() => navigate('/todos-reminders')}
              className={`font-serif flex items-center gap-2 transition-colors text-sm lg:text-base ${
                isActive('/todos-reminders')
                  ? 'text-[#C5A059] font-semibold'
                  : 'text-[#3E2723] hover:text-[#5D4037]'
              }`}
            >
              <CheckSquare className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">To-dos</span>
            </button>
            <div className="w-px h-6 bg-[#EFE6D5]"></div>
            <button
              data-testid="logout-btn"
              onClick={handleLogout}
              className="text-[#5D4037] hover:text-[#B71C1C] font-serif flex items-center gap-2 transition-colors text-sm lg:text-base"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#3E2723] hover:bg-[#EFE6D5] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#EFE6D5] pt-4 space-y-2">
            <button
              onClick={() => handleNavClick('/dashboard')}
              className={`w-full font-serif flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-[#C5A059] text-white font-semibold'
                  : 'text-[#3E2723] hover:bg-[#EFE6D5]'
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </button>
            <button
              onClick={() => handleNavClick('/entries')}
              className={`w-full font-serif flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/entries')
                  ? 'bg-[#C5A059] text-white font-semibold'
                  : 'text-[#3E2723] hover:bg-[#EFE6D5]'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Entries
            </button>
            <button
              onClick={() => handleNavClick('/statistics')}
              className={`w-full font-serif flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/statistics')
                  ? 'bg-[#C5A059] text-white font-semibold'
                  : 'text-[#3E2723] hover:bg-[#EFE6D5]'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Statistics
            </button>
            <button
              onClick={() => handleNavClick('/todos-reminders')}
              className={`w-full font-serif flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/todos-reminders')
                  ? 'bg-[#C5A059] text-white font-semibold'
                  : 'text-[#3E2723] hover:bg-[#EFE6D5]'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              To-dos & Reminders
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-[#5D4037] hover:bg-[#FFEBEE] font-serif flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
