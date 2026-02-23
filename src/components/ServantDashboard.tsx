import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, Plus, FileText, BarChart3, Download, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { createTeam } from "@/services/teamService";
import { auth } from "@/services/firebase";

export default function ServantDashboard() {
  const { user, getAuthToken } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState('attendance');
  const [showAddPoints, setShowAddPoints] = useState<number | null>(null);
  const [pointsAmount, setPointsAmount] = useState(10);
  const [pointsReason, setPointsReason] = useState('Active Participation');
  const [teamName, setTeamName] = useState("");

  if (user?.role !== 'servant') {
    return <div className="text-center font-bold text-red-500">Unauthorized access.</div>;
  }

  const fetchWithAuth = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = await getAuthToken();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  };

  useEffect(() => {
    const loadStudents = async () => {
      if (!user?.class_id) return;
      const res = await fetchWithAuth(`/api/servant/students/${user.class_id}`);
      if (!res.ok) return;
      const data = await res.json();
      setStudents(data);
    };

    loadStudents();
  }, [user]);

  const toggleAttendance = async (studentId: number) => {
    const newStatus = !attendance[studentId];
    setAttendance(prev => ({ ...prev, [studentId]: newStatus }));
    
    await fetchWithAuth('/api/servant/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        date: new Date().toISOString().split('T')[0],
        type: 'lesson',
        status: newStatus ? 1 : 0
      }),
    });
  };

  const addPoints = async (studentId: number) => {
    await fetchWithAuth('/api/servant/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        points: pointsAmount,
        reason: pointsReason,
        date: new Date().toISOString().split('T')[0]
      }),
    });
    
    const res = await fetchWithAuth(`/api/servant/students/${user?.class_id}`);
    const data = await res.json();
    setStudents(data);
    setShowAddPoints(null);
  };

  const handleCreateTeam = async () => {
    if (!auth.currentUser) {
      alert("لازم تكون مسجل دخول!");
      return;
    }
    try {
      await createTeam(teamName, auth.currentUser.uid);
      alert("الفريق اتعمل بنجاح!");
      setTeamName("");
    } catch (err) {
      console.error(err);
      alert("حصل خطأ، حاول تاني.");
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "class_report.xlsx");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B3D91] uppercase italic">Class Dashboard</h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Managing Grade {user?.class_id} • {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button className="flex items-center gap-2 bg-[#0B3D91] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#1a56b8] transition-all shadow-lg shadow-[#0B3D91]/20">
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </header>

      <div className="flex gap-4 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-tighter transition-all relative ${activeTab === 'attendance' ? 'text-[#0B3D91]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Attendance
          {activeTab === 'attendance' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B3D91] rounded-t-full" />}
        </button>

        <button 
          onClick={() => setActiveTab('scoring')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-tighter transition-all relative ${activeTab === 'scoring' ? 'text-[#0B3D91]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Weekly Scoring
          {activeTab === 'scoring' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B3D91] rounded-t-full" />}
        </button>

        <button 
          onClick={() => setActiveTab('createTeam')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-tighter transition-all relative ${activeTab === 'createTeam' ? 'text-[#0B3D91]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Create Team
          {activeTab === 'createTeam' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B3D91] rounded-t-full" />}
        </button>

        <button 
          onClick={() => setActiveTab('reports')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-tighter transition-all relative ${activeTab === 'reports' ? 'text-[#0B3D91]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Follow-up Reports
          {activeTab === 'reports' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B3D91] rounded-t-full" />}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'attendance' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#0B3D91] uppercase italic">Lesson Attendance - {new Date().toLocaleDateString()}</h3>
              <div className="flex items-center gap-4 text-xs font-bold uppercase text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#00C853]" /> Present</span>
                <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500" /> Absent</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => toggleAttendance(student.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    attendance[student.id] 
                      ? 'bg-green-50 border-[#00C853] shadow-md shadow-green-100' 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="" />
                    </div>
                    <span className={`font-bold ${attendance[student.id] ? 'text-[#00C853]' : 'text-gray-600'}`}>{student.name}</span>
                  </div>
                  {attendance[student.id] ? <CheckCircle2 className="w-6 h-6 text-[#00C853]" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-100" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4">Student</th>
                  <th className="pb-4 text-center">Current Points</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => (
                  <tr key={student.id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="" />
                        </div>
                        <span className="font-bold text-[#0B3D91]">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="font-black text-[#00C853]">{student.points}</span>
                    </td>
                    <td className="py-4 text-right">
                      {showAddPoints === student.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            type="number" 
                            value={pointsAmount}
                            onChange={(e) => setPointsAmount(Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm font-bold"
                          />
                          <button 
                            onClick={() => addPoints(student.id)}
                            className="bg-[#00C853] text-white p-1.5 rounded-lg hover:bg-[#00e661]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowAddPoints(null)}
                            className="bg-gray-100 text-gray-400 p-1.5 rounded-lg hover:bg-gray-200"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowAddPoints(student.id)}
                          className="bg-[#FFC107] text-[#0B3D91] px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-[#FFD54F] transition-all"
                        >
                          Add Points
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'createTeam' && (
          <div className="p-6 space-y-6">
            <h3 className="font-black text-[#0B3D91] uppercase italic">Create New Team</h3>
            <div className="max-w-md space-y-4">
              <input
                type="text"
                placeholder="اكتب اسم الفريق"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:outline-none focus:border-[#0B3D91] transition-all"
              />
              <button
                onClick={handleCreateTeam}
                className="flex items-center gap-2 bg-[#0B3D91] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-[#1a56b8] transition-all shadow-lg shadow-[#0B3D91]/20"
              >
                <Plus className="w-4 h-4" />
                إنشاء الفريق
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#0B3D91] uppercase italic">Follow-up Logs</h3>
              <button className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all">
                <FileText className="w-4 h-4" />
                New Report
              </button>
            </div>
            
            <div className="space-y-4">
              {students.slice(0, 3).map((student) => (
                <div key={student.id} className="p-4 rounded-2xl border border-gray-100 flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#0B3D91]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0B3D91]">{student.name}</h4>
                      <p className="text-xs text-gray-400">Last contacted: Feb 18, 2026</p>
                      <p className="text-sm text-gray-600 mt-2">"Discussed Bible reading progress. Student is excited about the next lesson."</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-[#0B3D91] hover:underline">Edit</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
