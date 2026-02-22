import { useState, useEffect } from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus, Star, Shield } from 'lucide-react';
import { motion } from 'motion/react';

// const GRADE_FILTERS = ['All', '1', '2', '3'];
const GRADE_FILTERS = ['All'];


const RANK_STYLES = [
  {
    wrap: 'bg-gradient-to-br from-[#FFC107] to-[#FFB300]',
    text: 'text-[#0B3D91]',
    shadow: 'shadow-[0_4px_16px_rgba(255,193,7,0.5)]',
    rowBg: 'bg-gradient-to-r from-[#FFC107]/8 to-transparent',
    border: 'border-l-4 border-[#FFC107]',
  },
  {
    wrap: 'bg-gradient-to-br from-[#B0BEC5] to-[#90A4AE]',
    text: 'text-white',
    shadow: 'shadow-[0_4px_12px_rgba(144,164,174,0.4)]',
    rowBg: 'bg-gradient-to-r from-[#B0BEC5]/8 to-transparent',
    border: 'border-l-4 border-[#90A4AE]',
  },
  {
    wrap: 'bg-gradient-to-br from-[#D4956A] to-[#CD7F32]',
    text: 'text-white',
    shadow: 'shadow-[0_4px_12px_rgba(205,127,50,0.4)]',
    rowBg: 'bg-gradient-to-r from-[#CD7F32]/8 to-transparent',
    border: 'border-l-4 border-[#CD7F32]',
  },
];

export default function LeagueTable() {
  const [teams, setTeams] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/public/teams')
      .then(res => res.json())
      .then(data => setTeams(data));
  }, []);

  const filtered =
    filter === 'All' ? teams : teams.filter(t => String(t.grade) === filter);

  return (
    <div
      className="space-y-6 pb-12"
      style={{ fontFamily: "'Barlow Condensed', 'Impact', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');
        .team-row { transition: background 0.15s, transform 0.15s; }
        .team-row:hover { transform: translateX(4px); }
        .filter-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B3D91] flex items-center justify-center shadow-lg shadow-[#0B3D91]/30">
            <Trophy className="w-6 h-6 text-[#FFC107]" />
          </div>
          <div>
            <h1
              className="text-3xl font-black italic uppercase text-[#0B3D91] leading-none"
              style={{ letterSpacing: '-0.02em' }}
            >
              League Standings
            </h1>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Season 2026 · Live Rankings
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {GRADE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                filter === f
                  ? 'bg-[#0B3D91] text-white shadow-md shadow-[#0B3D91]/30 scale-105'
                  : 'text-gray-400 hover:text-[#0B3D91] hover:bg-gray-50'
              }`}
            >
              {f === 'All' ? 'All Grades' : `Grade ${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table Card ─── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[56px_1fr_100px_80px_80px] px-6 py-3 bg-gray-50 border-b border-gray-100">
          {['#', 'Team', 'Points', 'Trend', 'Awards'].map((h, i) => (
            <span
              key={h}
              className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ${
                i >= 2 ? 'text-center' : ''
              }`}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50/80">
          {filtered.map((team, index) => {
            const rs = RANK_STYLES[index] ?? null;
            const isTop3 = index < 3;

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
                className={`team-row grid grid-cols-[56px_1fr_100px_80px_80px] items-center px-6 py-4 ${
                  isTop3 ? rs!.rowBg + ' ' + rs!.border : 'hover:bg-gray-50/60'
                }`}
              >
                {/* Rank badge */}
                <div>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black select-none ${
                      isTop3
                        ? `${rs!.wrap} ${rs!.text} ${rs!.shadow}`
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Team */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={team.logo_url}
                      className={`w-11 h-11 rounded-full object-cover border-2 shadow-sm ${
                        isTop3 ? 'border-white shadow-md' : 'border-gray-100'
                      }`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${team.name}`;
                      }}
                    />
                    {index === 0 && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FFC107] rounded-full flex items-center justify-center shadow">
                        <Star className="w-2.5 h-2.5 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span
                      className={`font-black text-base italic uppercase leading-none ${
                        isTop3 ? 'text-[#0B3D91]' : 'text-gray-700'
                      }`}
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {team.name}
                    </span>
                    {team.grade && (
                      <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        Grade {team.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-center">
                  <span
                    className={`font-black text-2xl italic ${
                      isTop3 ? 'text-[#0B3D91]' : 'text-gray-600'
                    }`}
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {team.points}
                  </span>
                  <span className="block text-[9px] font-bold text-gray-300 uppercase tracking-widest">pts</span>
                </div>

                {/* Trend */}
                <div className="flex justify-center">
                  {index === 0 ? (
                    <div className="flex items-center gap-0.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500">TOP</span>
                    </div>
                  ) : index === filtered.length - 1 ? (
                    <div className="flex items-center gap-0.5 bg-red-50 px-2.5 py-1 rounded-full">
                      <ArrowDown className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  ) : (
                    <Minus className="w-4 h-4 text-gray-200" />
                  )}
                </div>

                {/* Badges */}
                <div className="flex justify-center gap-1.5">
                  {index === 0 && (
                    <div
                      title="League Leader"
                      className="w-7 h-7 bg-gradient-to-br from-[#FFC107] to-[#FFB300] rounded-full flex items-center justify-center shadow shadow-[#FFC107]/40"
                    >
                      <Trophy className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {team.points > 100 && (
                    <div
                      title="Century Club"
                      className="w-7 h-7 bg-gradient-to-br from-[#00C853] to-[#009624] rounded-full flex items-center justify-center shadow shadow-[#00C853]/30"
                    >
                      <Shield className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-black uppercase italic text-xl">
              No teams found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            {filtered.length} team{filtered.length !== 1 ? 's' : ''} shown
          </span>
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#FFC107]" /> Leader
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#00C853]" /> 100+ pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}