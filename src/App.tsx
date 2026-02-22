/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LeagueTable from './components/LeagueTable';
import PlayerRanking from './components/PlayerRanking';
import ServantDashboard from './components/ServantDashboard';
import LeaderDashboard from './components/LeaderDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, ShieldCheck, Trophy } from 'lucide-react';

function AppContent() {
  const { user, login, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(username, password);
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
    } catch (err) {
      setLoginError('Invalid username or password');
    }
  };

  if (isLoading) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'league': return <LeagueTable />;
      case 'players': return <PlayerRanking />;
      case 'servant-dashboard': return <ServantDashboard />;
      case 'leader-dashboard': return <LeaderDashboard />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900">
      <Navbar 
        onLoginClick={() => setShowLoginModal(true)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-[#0B3D91]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-[#0B3D91] p-8 text-white relative">
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-[#FFC107] p-4 rounded-2xl shadow-lg">
                    <ShieldCheck className="w-8 h-8 text-[#0B3D91]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Servant Access</h2>
                    <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Enter your credentials</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="p-8 space-y-6">
                {loginError && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] transition-all font-bold"
                    placeholder="e.g. servant_john"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0B3D91] text-white py-4 rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-[#0B3D91]/20 hover:bg-[#1a56b8] transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFC107]" />
            <span className="font-black text-[#0B3D91] uppercase italic">Youth League 2026</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Built for the next generation of champions.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
