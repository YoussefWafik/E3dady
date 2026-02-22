import { motion } from 'motion/react';
import { Trophy, Star, TrendingUp, Calendar, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
  teams: any[];
  topStudents: any[];
  mvp: any;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3D91]"></div></div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-3xl overflow-hidden bg-[#0B3D91] flex items-center px-8 md:px-16 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://picsum.photos/seed/football-field/1920/1080?blur=2" 
            alt="Field" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#FFC107] text-[#0B3D91] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
          >
            <Star className="w-4 h-4 fill-current" />
            Season 2026 is Live
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white italic uppercase leading-none tracking-tighter"
          >
            The Ultimate <br /> <span className="text-[#00C853]">Youth League</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg md:text-xl max-w-md"
          >
            Play hard, pray harder. Join the most energetic football-themed service league for grades 1-3.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-2xl font-bold text-white">04</span>
              <span className="text-[10px] uppercase text-white/60 font-bold">Days to Friday</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-2xl font-bold text-white">12</span>
              <span className="text-[10px] uppercase text-white/60 font-bold">Teams Active</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Podium / Top Teams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#0B3D91] uppercase italic flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FFC107]" />
              League Podium
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-end h-[300px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* 2nd Place */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '70%' }}
              className="bg-gray-100 rounded-t-2xl flex flex-col items-center justify-end pb-6 relative group"
            >
              <div className="absolute -top-12 flex flex-col items-center">
                <img src={stats.teams[1]?.logo_url} className="w-16 h-16 rounded-full border-4 border-gray-200 shadow-lg" referrerPolicy="no-referrer" />
                <span className="font-bold text-sm mt-2">{stats.teams[1]?.name}</span>
              </div>
              <span className="text-4xl font-black text-gray-300">2</span>
            </motion.div>
            
            {/* 1st Place */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '90%' }}
              className="bg-[#FFC107]/10 border-2 border-[#FFC107] rounded-t-2xl flex flex-col items-center justify-end pb-6 relative"
            >
              <div className="absolute -top-16 flex flex-col items-center">
                <div className="relative">
                  <Trophy className="absolute -top-6 -right-6 w-10 h-10 text-[#FFC107] animate-bounce" />
                  <img src={stats.teams[0]?.logo_url} className="w-20 h-20 rounded-full border-4 border-[#FFC107] shadow-xl" referrerPolicy="no-referrer" />
                </div>
                <span className="font-bold text-lg mt-2 text-[#0B3D91]">{stats.teams[0]?.name}</span>
              </div>
              <span className="text-6xl font-black text-[#FFC107]">1</span>
            </motion.div>

            {/* 3rd Place */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '50%' }}
              className="bg-orange-50 rounded-t-2xl flex flex-col items-center justify-end pb-6 relative"
            >
              <div className="absolute -top-10 flex flex-col items-center">
                <img src={stats.teams[2]?.logo_url} className="w-14 h-14 rounded-full border-4 border-orange-200 shadow-lg" referrerPolicy="no-referrer" />
                <span className="font-bold text-sm mt-2">{stats.teams[2]?.name}</span>
              </div>
              <span className="text-3xl font-black text-orange-200">3</span>
            </motion.div>
          </div>
        </div>

        {/* Weekly MVP Card */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0B3D91] uppercase italic flex items-center gap-2">
            <Star className="w-6 h-6 text-[#FFC107]" />
            Weekly MVP
          </h2>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#0B3D91] to-[#1a56b8] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 p-4">
              <Trophy className="w-12 h-12 text-[#FFC107] opacity-20" />
            </div>
            <div className="space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.mvp?.name}`} alt="MVP" className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-3xl font-black italic uppercase">{stats.mvp?.name}</h3>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">{stats.mvp?.team_name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  <span className="block text-[10px] uppercase text-white/50 font-bold">Points</span>
                  <span className="text-xl font-black text-[#FFC107]">{stats.mvp?.points}</span>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  <span className="block text-[10px] uppercase text-white/50 font-bold">Rank</span>
                  <span className="text-xl font-black text-[#00C853]">#1</span>
                </div>
              </div>
              <button className="w-full bg-[#00C853] py-3 rounded-xl font-black uppercase tracking-tighter text-sm hover:bg-[#00e661] transition-colors shadow-lg shadow-[#00C853]/20">
                View Profile
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Links / Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase">Next Lesson</span>
            <span className="font-bold text-[#0B3D91]">Friday, 6:00 PM</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase">League Avg</span>
            <span className="font-bold text-[#0B3D91]">142 Points</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-yellow-50 p-3 rounded-2xl">
            <Users className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase">Active Students</span>
            <span className="font-bold text-[#0B3D91]">48 Players</span>
          </div>
        </div>
        <div className="bg-[#00C853] p-6 rounded-3xl shadow-lg shadow-[#00C853]/20 flex items-center gap-4 text-white">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white/70 uppercase">Team of Week</span>
            <span className="font-bold">Lions FC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
