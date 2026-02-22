import { Trophy, Users, Star, LayoutDashboard, LogOut, Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onLoginClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ onLoginClick, activeTab, setActiveTab }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Star, roles: ['public', 'servant', 'leader'] },
    { id: 'league', label: 'League', icon: Trophy, roles: ['public', 'servant', 'leader'] },
    { id: 'players', label: 'Players', icon: Users, roles: ['public', 'servant', 'leader'] },
    { id: 'servant-dashboard', label: 'Class', icon: LayoutDashboard, roles: ['servant'] },
    { id: 'leader-dashboard', label: 'Admin', icon: LayoutDashboard, roles: ['leader'] },
  ];

  const filteredItems = navItems.filter(item => 
    item.roles.includes('public') || (user && item.roles.includes(user.role))
  );

  return (
    <nav className="bg-[#0B3D91] text-white sticky top-0 z-50 shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-[#00C853] p-1.5 rounded-full shadow-inner">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase italic">Youth League</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                <span className="text-xs font-semibold text-[#FFC107] uppercase tracking-wider">{user.name}</span>
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-red-500/20 rounded-full text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="ml-4 bg-[#FFC107] text-[#0B3D91] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#FFD54F] transition-all transform hover:scale-105 active:scale-95 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B3D91] border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-md text-base font-medium ${
                    activeTab === item.id 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-base font-bold text-[#FFC107]"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </button>
              )}
              {user && (
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-md text-base font-bold text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  Logout ({user.name})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
