import { useState, useEffect } from 'react';
import { Users, Search, Star, Medal, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MEDAL_CONFIG = [
  {
    gradient: 'from-[#FFC107] to-[#FFB300]',
    shadow: 'shadow-[#FFC107]/40',
    border: 'border-[#FFC107]',
    badge: 'bg-gradient-to-br from-[#FFC107] to-[#FFB300]',
    bar: 'from-[#FFC107] to-[#FF8F00]',
    glow: 'shadow-[0_0_32px_rgba(255,193,7,0.25)]',
    label: '🥇',
  },
  {
    gradient: 'from-[#B0BEC5] to-[#78909C]',
    shadow: 'shadow-[#90A4AE]/40',
    border: 'border-[#90A4AE]',
    badge: 'bg-gradient-to-br from-[#CFD8DC] to-[#90A4AE]',
    bar: 'from-[#90A4AE] to-[#607D8B]',
    glow: '',
    label: '🥈',
  },
  {
    gradient: 'from-[#D4956A] to-[#A0522D]',
    shadow: 'shadow-[#CD7F32]/40',
    border: 'border-[#CD7F32]',
    badge: 'bg-gradient-to-br from-[#D4956A] to-[#CD7F32]',
    bar: 'from-[#D4956A] to-[#8B4513]',
    glow: '',
    label: '🥉',
  },
];

const LEVEL_TITLES = ['Rookie', 'Player', 'Pro', 'All‑Star', 'Legend'];

function getLevelTitle(points: number) {
  const lvl = Math.floor(points / 50);
  return LEVEL_TITLES[Math.min(lvl, LEVEL_TITLES.length - 1)];
}

export default function PlayerRanking() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/public/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const filtered = students.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxPoints = Math.max(...students.map(s => s.points), 1);

  return (
    <div
      className="space-y-6 pb-12"
      style={{ fontFamily: "'Barlow Condensed', 'Impact', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');
        .player-card { transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease; }
        .player-card:hover { transform: translateY(-6px) scale(1.01); }
        .search-input:focus { box-shadow: 0 0 0 3px rgba(11,61,145,0.15); }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
      `}</style>

      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00C853] to-[#009624] flex items-center justify-center shadow-lg shadow-[#00C853]/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className="text-3xl font-black italic uppercase text-[#0B3D91] leading-none"
              style={{ letterSpacing: '-0.02em' }}
            >
              Player Rankings
            </h1>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {students.length} players · Season 2026
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search players or teams…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0B3D91] w-full md:w-64 shadow-sm text-sm font-semibold placeholder-gray-300 transition-all"
            style={{ fontFamily: 'Barlow, sans-serif' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 font-black text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ─── Top 3 Podium Strip ─── */}
      {!searchTerm && students.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          {[1, 0, 2].map(i => {
            const s = students[i];
            const m = MEDAL_CONFIG[i];
            const isFirst = i === 0;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                className={`relative rounded-3xl p-5 flex flex-col items-center gap-2 border-2 ${m.border} ${isFirst ? m.glow + ' bg-gradient-to-b from-[#FFC107]/10 to-white' : 'bg-white'} overflow-hidden`}
              >
                {isFirst && (
                  <div className="absolute top-2 right-2 text-lg">👑</div>
                )}
                <span className="text-3xl">{m.label}</span>
                <div className={`w-16 h-16 rounded-full border-4 ${m.border} shadow-lg overflow-hidden`}>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`}
                    alt={s.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-center">
                  <p className={`font-black italic uppercase text-sm text-[#0B3D91] leading-tight`} style={{ letterSpacing: '-0.01em' }}>
                    {s.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.team_name}</p>
                </div>
                <div className={`bg-gradient-to-r ${m.bar} text-white font-black text-lg px-4 py-1 rounded-full`} style={{ letterSpacing: '-0.02em' }}>
                  {s.points} <span className="text-xs font-semibold opacity-70">pts</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ─── All Players Grid ─── */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((student, index) => {
            const medal = index < 3 ? MEDAL_CONFIG[index] : null;
            const pct = (student.points / maxPoints) * 100;
            const lvl = Math.floor(student.points / 50) + 1;
            const title = getLevelTitle(student.points);

            return (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: index * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
                className={`player-card bg-white rounded-3xl border overflow-hidden relative ${
                  medal ? `border-2 ${medal.border} ${medal.glow}` : 'border-gray-100'
                }`}
              >
                {/* Top accent bar */}
                <div
                  className={`h-1.5 w-full ${
                    medal ? `bg-gradient-to-r ${medal.bar}` : 'bg-gray-100'
                  }`}
                />

                <div className="p-5 space-y-4">
                  {/* Player info */}
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        medal
                          ? `${medal.badge} text-white shadow-md shadow-${medal.shadow}`
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 rounded-2xl overflow-hidden border-2 flex-shrink-0 ${
                        medal ? medal.border : 'border-gray-100'
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                        alt={student.name}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Name + team */}
                    <div className="min-w-0">
                      <h3
                        className="font-black italic uppercase text-[#0B3D91] leading-tight truncate"
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        {student.name}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                        {student.team_name}
                      </p>
                    </div>

                    {/* Medal emoji top-right */}
                    {medal && (
                      <span className="ml-auto text-xl flex-shrink-0">{medal.label}</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Season Progress
                      </span>
                      <span
                        className="font-black text-[#0B3D91] text-sm italic"
                        style={{ letterSpacing: '-0.02em' }}
                      >
                        {student.points}{' '}
                        <span className="text-[10px] font-semibold text-gray-400 not-italic">pts</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: index * 0.04, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          medal
                            ? `bg-gradient-to-r ${medal.bar}`
                            : 'bg-gradient-to-r from-[#00C853] to-[#009624]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 bg-[#0B3D91]/5 px-3 py-1.5 rounded-xl">
                      <Zap className="w-3.5 h-3.5 text-[#FFC107]" />
                      <span className="text-xs font-black text-[#0B3D91] uppercase">
                        Lvl {lvl}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        · {title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      <Shield className="w-3 h-3" />
                      Grade {student.grade}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center gap-3 text-gray-300"
            >
              <Search className="w-10 h-10" />
              <p className="font-black italic uppercase text-xl">No players found</p>
              <p className="text-sm font-semibold text-gray-300">Try a different search</p>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}