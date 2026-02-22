import { useState, useEffect } from 'react';
import { Users, Search, Star, Medal } from 'lucide-react';
import { motion } from 'motion/react';

export default function PlayerRanking() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/public/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxPoints = Math.max(...students.map(s => s.points), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-[#0B3D91] uppercase italic flex items-center gap-3">
          <Users className="w-8 h-8 text-[#00C853]" />
          Player Rankings
        </h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search players or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] w-full md:w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            {index < 3 && (
              <div className="absolute top-0 right-0 p-4">
                <Medal className={`w-8 h-8 ${index === 0 ? 'text-[#FFC107]' : index === 1 ? 'text-gray-300' : 'text-orange-300'}`} />
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt={student.name} className="w-full h-full" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#0B3D91] uppercase italic">{student.name}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{student.team_name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span className="text-gray-400">Season Progress</span>
                <span className="text-[#0B3D91]">{student.points} pts</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(student.points / maxPoints) * 100}%` }}
                  className="h-full bg-[#00C853]"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#FFC107] fill-current" />
                <span className="text-xs font-black text-[#0B3D91]">LVL {Math.floor(student.points / 50) + 1}</span>
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Grade {student.grade}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
