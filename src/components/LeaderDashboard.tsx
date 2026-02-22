import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Trophy, CheckCircle, AlertCircle, Search, Filter, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function LeaderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch('/api/leader/dashboard')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3D91]"></div></div>;

  const chartData = [
    { name: 'Mon', points: 400 },
    { name: 'Tue', points: 300 },
    { name: 'Wed', points: 600 },
    { name: 'Thu', points: 800 },
    { name: 'Fri', points: 1200 },
    { name: 'Sat', points: 900 },
    { name: 'Sun', points: 500 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#FFC107] p-3 rounded-2xl shadow-lg shadow-yellow-100">
            <Shield className="w-8 h-8 text-[#0B3D91]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0B3D91] uppercase italic">Admin HQ</h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Global League Oversight • {user?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 p-2 rounded-xl text-gray-400 hover:text-[#0B3D91] transition-all">
            <Settings className="w-6 h-6" />
          </button>
          <button className="bg-[#00C853] text-white px-6 py-2 rounded-xl font-black uppercase tracking-tighter shadow-lg shadow-green-100 hover:bg-[#00e661] transition-all">
            Global Report
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-2 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            <span className="text-[10px] font-black text-green-500 uppercase">+12%</span>
          </div>
          <span className="text-3xl font-black text-[#0B3D91]">{stats.totalStudents.count}</span>
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Students</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-50 p-2 rounded-lg"><Trophy className="w-5 h-5 text-yellow-600" /></div>
            <span className="text-[10px] font-black text-gray-400 uppercase">Active</span>
          </div>
          <span className="text-3xl font-black text-[#0B3D91]">{stats.totalTeams.count}</span>
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Teams</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <span className="text-[10px] font-black text-green-500 uppercase">98%</span>
          </div>
          <span className="text-3xl font-black text-[#0B3D91]">{stats.totalPoints.sum}</span>
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Points</span>
        </div>
        <div className="bg-[#0B3D91] p-6 rounded-3xl shadow-xl shadow-blue-100 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/10 p-2 rounded-lg"><AlertCircle className="w-5 h-5 text-[#FFC107]" /></div>
            <span className="text-[10px] font-black text-[#FFC107] uppercase">Action Required</span>
          </div>
          <span className="text-3xl font-black">{stats.pendingApprovals.count}</span>
          <span className="block text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Pending Approvals</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-[#0B3D91] uppercase italic">Points Distribution</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black uppercase text-gray-400">Week</button>
                <button className="px-3 py-1 bg-[#0B3D91] rounded-lg text-[10px] font-black uppercase text-white">Month</button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="points" fill="#0B3D91" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-[#0B3D91] uppercase italic">Recent Activity</h3>
              <button className="text-xs font-bold text-[#0B3D91] hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0B3D91]">Points Approved for Mark Anthony</p>
                      <p className="text-xs text-gray-400">By Servant John • 2 hours ago</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#00C853]">+25 pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <div className="bg-[#0B3D91] p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-black uppercase italic">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all border border-white/10 flex items-center gap-3">
                  <div className="bg-[#FFC107] p-2 rounded-lg"><Trophy className="w-4 h-4 text-[#0B3D91]" /></div>
                  <span className="text-sm font-bold">Assign Special Points</span>
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all border border-white/10 flex items-center gap-3">
                  <div className="bg-[#00C853] p-2 rounded-lg"><Users className="w-4 h-4 text-white" /></div>
                  <span className="text-sm font-bold">Manage Servants</span>
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all border border-white/10 flex items-center gap-3">
                  <div className="bg-red-500 p-2 rounded-lg"><AlertCircle className="w-4 h-4 text-white" /></div>
                  <span className="text-sm font-bold">System Alerts</span>
                </button>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 opacity-10 rotate-12">
              <Shield className="w-48 h-48" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-black text-[#0B3D91] uppercase italic mb-6">Top Servants</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=servant${i}`} alt="" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0B3D91]">Servant {i}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Grade {i}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#0B3D91]">1,240</p>
                    <p className="text-[10px] font-bold text-[#00C853] uppercase">Active</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
