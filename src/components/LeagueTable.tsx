import { useState, useEffect } from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus, Filter, Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function LeagueTable() {
  const [teams, setTeams] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/public/teams')
      .then(res => res.json())
      .then(data => setTeams(data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-[#0B3D91] uppercase italic flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[#FFC107]" />
          League Standings
        </h1>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === 'all' ? 'bg-[#0B3D91] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            All Grades
          </button>
          <button 
            onClick={() => setFilter('1')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === '1' ? 'bg-[#0B3D91] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Grade 1
          </button>
          <button 
            onClick={() => setFilter('2')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === '2' ? 'bg-[#0B3D91] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Grade 2
          </button>
          <button 
            onClick={() => setFilter('3')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === '3' ? 'bg-[#0B3D91] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Grade 3
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Points</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trend</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teams.map((team, index) => (
              <motion.tr 
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                    index === 0 ? 'bg-[#FFC107] text-[#0B3D91]' : 
                    index === 1 ? 'bg-gray-200 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img src={team.logo_url} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                    <span className="font-bold text-[#0B3D91] group-hover:translate-x-1 transition-transform">{team.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="font-black text-lg text-[#0B3D91]">{team.points}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    {index === 0 ? (
                      <ArrowUp className="w-4 h-4 text-[#00C853]" />
                    ) : index === teams.length - 1 ? (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-1">
                    {index === 0 && <div className="w-6 h-6 bg-[#FFC107] rounded-full flex items-center justify-center shadow-sm"><Star className="w-3 h-3 text-white fill-current" /></div>}
                    {team.points > 100 && <div className="w-6 h-6 bg-[#00C853] rounded-full flex items-center justify-center shadow-sm"><Trophy className="w-3 h-3 text-white" /></div>}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
