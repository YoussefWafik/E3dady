import { motion } from 'motion/react';
import { Trophy, Star, TrendingUp, Calendar, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
  teams: any[];
  topStudents: any[];
  mvp: any;
}

const PODIUM_COLORS = [
  {
    bar: 'bg-gradient-to-t from-[#FFC107] to-[#FFD54F]',
    border: 'border-[#FFC107]',
    text: 'text-[#FFC107]',
    glow: 'shadow-[0_0_40px_rgba(255,193,7,0.4)]',
    imgBorder: 'border-[#FFC107]',
    height: '85%',
    rank: '1',
    rankSize: 'text-5xl',
  },
  {
    bar: 'bg-gradient-to-t from-[#90A4AE] to-[#B0BEC5]',
    border: 'border-[#90A4AE]',
    text: 'text-[#90A4AE]',
    glow: '',
    imgBorder: 'border-[#90A4AE]',
    height: '65%',
    rank: '2',
    rankSize: 'text-4xl',
  },
  {
    bar: 'bg-gradient-to-t from-[#CD7F32] to-[#D4956A]',
    border: 'border-[#CD7F32]',
    text: 'text-[#CD7F32]',
    glow: '',
    imgBorder: 'border-[#CD7F32]',
    height: '50%',
    rank: '3',
    rankSize: 'text-3xl',
  },
];

const PODIUM_ORDER = [1, 0, 2]; // silver, gold, bronze visual order

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats)
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-[#0B3D91]/20 border-t-[#0B3D91] animate-spin" />
          <Trophy className="absolute inset-0 m-auto w-6 h-6 text-[#FFC107]" />
        </div>
      </div>
    );

  return (
    <div
      className="space-y-8 pb-16 min-h-screen"
      style={{ fontFamily: "'Barlow Condensed', 'Impact', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(11,61,145,0.12); }
        .podium-bar { transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .float { animation: float 3s ease-in-out infinite; }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        .pulse-ring::after { content:''; position:absolute; inset:-6px; border-radius:9999px; border:2px solid #FFC107; animation:pulse-ring 2s ease-out infinite; }
      `}</style>

      {/* ═══ HERO BANNER ═══ */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0B3D91 0%, #1565C0 50%, #0D47A1 100%)',
          minHeight: 200,
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.3) 39px,rgba(255,255,255,0.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.3) 39px,rgba(255,255,255,0.3) 40px)',
          }}
        />
        {/* Decorative circle */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-16 w-56 h-56 rounded-full bg-[#FFC107]/10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 py-10">
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-[#FFC107] text-[#0B3D91] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Season 2026 · Live Now
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl md:text-6xl font-black italic uppercase text-white leading-none"
              style={{ letterSpacing: '-0.02em' }}
            >
              Youth <span className="text-[#FFC107]">League</span>
              <br />
              <span className="text-2xl md:text-3xl font-semibold not-italic text-white/60 tracking-wide">
                Grades 1 – 3
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="flex gap-4"
          >
            {[
              { label: 'Next Session', value: 'Friday', sub: '6:00 PM' },
              { label: 'Active Teams', value: stats.teams?.length ?? 0, sub: 'competing' },
              { label: 'Students', value: '48', sub: 'players' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl flex flex-col items-center min-w-[80px]"
              >
                <span className="text-2xl font-black text-white">{item.value}</span>
                <span className="text-[9px] uppercase font-bold text-white/50 tracking-widest">{item.label}</span>
                <span className="text-[10px] text-white/40">{item.sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ PODIUM ═══ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-[#FFC107]" />
          <h2
            className="text-3xl font-black italic uppercase text-[#0B3D91]"
            style={{ letterSpacing: '-0.02em' }}
          >
            League Podium
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFC107]/40 to-transparent" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-end justify-center gap-4 h-[340px]">
            {PODIUM_ORDER.map((teamIdx) => {
              const c = PODIUM_COLORS[teamIdx];
              const team = stats.teams[teamIdx];
              const isFirst = teamIdx === 0;

              return (
                <motion.div
                  key={teamIdx}
                  className="flex-1 flex flex-col items-center"
                  style={{ maxWidth: 200 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: teamIdx * 0.15 + 0.2 }}
                >
                  {/* Team info above bar */}
                  <div className={`flex flex-col items-center mb-3 ${isFirst ? 'float' : ''}`}>
                    {isFirst && (
                      <Trophy className="w-8 h-8 text-[#FFC107] mb-1" />
                    )}
                    <div className={`relative ${isFirst ? 'pulse-ring' : ''}`}>
                      <img
                        src={team?.logo_url}
                        className={`rounded-full border-4 shadow-lg object-cover ${c.imgBorder} ${
                          isFirst ? 'w-20 h-20' : 'w-14 h-14'
                        } ${isFirst ? c.glow : ''}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${team?.name}`;
                        }}
                      />
                    </div>
                    <span
                      className={`font-black uppercase mt-2 text-center leading-tight ${
                        isFirst ? 'text-[#0B3D91] text-base' : 'text-gray-600 text-sm'
                      }`}
                    >
                      {team?.name ?? `Team ${teamIdx + 1}`}
                    </span>
                    {team?.points && (
                      <span className={`text-xs font-bold ${c.text}`}>
                        {team.points} pts
                      </span>
                    )}
                  </div>

                  {/* Bar */}
                  <motion.div
                    className={`w-full ${c.bar} rounded-t-2xl border-t-4 ${c.border} flex items-end justify-center pb-4`}
                    initial={{ height: 0 }}
                    animate={{ height: c.height }}
                    transition={{ duration: 0.9, delay: teamIdx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ minHeight: 60 }}
                  >
                    <span className={`${c.rankSize} font-black text-white/70 select-none`}>
                      {c.rank}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Base line */}
          <div className="mt-0 h-2 rounded-b-xl bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Calendar,
            label: 'Next Lesson',
            value: 'Friday',
            sub: '6:00 PM',
            bg: 'bg-blue-50',
            iconColor: 'text-[#0B3D91]',
            accent: '#0B3D91',
          },
          {
            icon: TrendingUp,
            label: 'League Average',
            value: '142',
            sub: 'Points',
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            accent: '#059669',
          },
          {
            icon: Users,
            label: 'Active Students',
            value: '48',
            sub: 'Players',
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            accent: '#D97706',
          },
          {
            icon: Star,
            label: 'Team of the Week',
            value: 'Lions',
            sub: 'FC',
            bg: 'bg-[#0B3D91]',
            iconColor: 'text-[#FFC107]',
            accent: '#FFC107',
            dark: true,
          },
        ].map(({ icon: Icon, label, value, sub, bg, iconColor, accent, dark }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.4 }}
            className={`stat-card ${bg} rounded-2xl p-5 flex flex-col gap-3 shadow-sm border ${
              dark ? 'border-[#0B3D91]' : 'border-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                dark ? 'bg-white/10' : 'bg-white shadow-sm'
              }`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <span
                className={`block text-[10px] font-bold uppercase tracking-widest ${
                  dark ? 'text-white/50' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-2xl font-black italic ${dark ? 'text-white' : 'text-[#0B3D91]'}`}
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {value}
                </span>
                <span
                  className={`text-sm font-semibold ${dark ? 'text-white/60' : 'text-gray-400'}`}
                >
                  {sub}
                </span>
              </div>
            </div>
            <div
              className="h-1 rounded-full opacity-30"
              style={{ background: accent }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}