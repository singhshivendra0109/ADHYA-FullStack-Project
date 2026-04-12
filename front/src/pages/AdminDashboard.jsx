import React, { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, BarChart3, TrendingUp, CheckCircle,
  XCircle, Search, LogOut, GraduationCap, ArrowRight, Activity,
  UserCircle, Plus, BookOpen, Briefcase, MapPin, X, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import StatCard from '../components/StatCard';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [newAchievement, setNewAchievement] = useState({
    student_name: "",
    score: "",
    subject: "",
    detail: "",
    teacher_id: "",
    color_theme: "bg-[#FFD97D]"
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes, pendingRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/pending-teachers')
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setPendingTeachers(pendingRes.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePostAchievement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/achievements', newAchievement);
      alert("Success Story Published!");
      setNewAchievement({ student_name: "", score: "", subject: "", detail: "", teacher_id: "", color_theme: "bg-[#FFD97D]" });
    } catch (err) {
      alert("Failed to post. Check if Teacher ID is correct.");
    }
  };

  const handleViewProfile = async (userId, role) => {
    try {
      const endpoint = role === 'teacher' ? `/profiles/user/${userId}` : `/student/${userId}`;
      const res = await api.get(endpoint);
      setSelectedProfile({ ...res.data, role });
    } catch (err) {
      alert("Profile data not complete.");
    }
  };

  const handleVerifyTeacher = async (teacherId, status) => {
    try {
      await api.patch(`/admin/teacher/${teacherId}/verify-flow`, { new_status: status });
      fetchData();
    } catch (err) { alert("Action failed."); }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/status`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: !u.is_verified } : u));
    } catch (err) { alert("Status toggle failed."); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#fcfefd]">
      <div className="w-16 h-16 border-4 border-[#1F6666] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfefd] text-left font-sans flex overflow-hidden relative">

      {/* 1. SIDEBAR */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col p-6 h-screen sticky top-0 shadow-2xl z-50">
        <div className="flex items-center gap-4 mb-20 px-2 cursor-pointer" onClick={() => navigate('/')}>
          <GraduationCap className="text-[#1F6666]" size={32} />
          <span className="text-2xl font-black uppercase tracking-tighter">ADHYA</span>
        </div>
        <nav className="flex-1 space-y-3">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#1F6666] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
            <BarChart3 size={20} /> Analytics
          </button>
          <button onClick={() => setActiveTab('accounts')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'accounts' ? 'bg-[#1F6666] text-white' : 'text-gray-400 hover:bg-white/5'}`}>
            <Users size={20} /> Database
          </button>
        </nav>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="flex items-center gap-4 p-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px] mt-auto hover:bg-red-500 hover:text-white transition-all">
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 h-screen overflow-y-auto p-12 bg-[#fcfefd]">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-6xl font-black uppercase tracking-tighter text-[#0F172A]">
            SYSTEM {activeTab === 'overview' ? 'OVERVIEW' : 'DATABASE'}
          </h1>
          {activeTab === 'accounts' && (
            <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl">
              <Search size={20} className="ml-4 text-gray-400" />
              <input placeholder="SEARCH USERS..." className="bg-transparent outline-none font-black text-[10px] uppercase w-64 pr-6" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          )}
        </header>

        {activeTab === 'overview' ? (
          <>
            <div className="grid grid-cols-4 gap-6 mb-16">
              <StatCard icon={TrendingUp} label="Revenue" value={`₹${analytics?.total_revenue_volume || 0}`} color="text-[#1F6666]" />
              <StatCard icon={Activity} label="Partnerships" value={analytics?.active_partnerships || 0} color="text-emerald-500" />
              <StatCard icon={Users} label="Students" value={analytics?.user_breakdown.students || 0} color="text-blue-500" />
              <StatCard icon={ShieldCheck} label="Queue" value={analytics?.user_breakdown.pending_teachers || 0} color="text-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-8">
                <h2 className="text-3xl font-black uppercase text-[#0F172A]">Manual Review Queue</h2>
                <div className="bg-[#f0f9f9] p-8 rounded-[3rem] border border-[#1F6666]/10 shadow-xl space-y-4">
                  {pendingTeachers.length > 0 ? pendingTeachers.map((teacher) => (
                    <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleViewProfile(teacher.user_id, 'teacher')}>
                        <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden">
                          {teacher.profile_picture ? <img src={teacher.profile_picture} className="w-full h-full object-cover" /> : <UserCircle className="text-gray-200" size={48} />}
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase text-[#0F172A]">{teacher.full_name}</h4>
                          <p className="text-[9px] font-black text-[#1F6666] uppercase">{teacher.subject}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleVerifyTeacher(teacher.user_id, "verified")} className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-all"><CheckCircle size={18} /></button>
                        <button onClick={() => handleVerifyTeacher(teacher.user_id, "rejected")} className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"><XCircle size={18} /></button>
                      </div>
                    </div>
                  )) : <p className="text-gray-400 font-bold uppercase text-xs text-center py-10">All verified.</p>}
                </div>
              </div>

              {/* ENLARGED SIDEBAR TOOLS: HEALTH & ACHIEVEMENT FORM */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#0F172A] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-[4px] text-emerald-400 mb-8">Platform Health</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-4"><span className="opacity-40 text-[9px]">ACTIVE HIRES</span><span className="font-black">{analytics?.active_partnerships || 0}</span></div>
                    <div className="flex justify-between"><span className="opacity-40 text-[9px]">TOTAL VALUE</span><span className="font-black text-emerald-400">₹{analytics?.total_revenue_volume || 0}</span></div>
                  </div>
                </div>

                {/*  ENLARGED SUCCESS POSTING BOX */}
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-orange-50 p-4 rounded-2xl text-[#F38137]">
                      <Trophy size={28} />
                    </div>
                    <h3 className="text-2xl font-black uppercase text-[#0F172A] tracking-tighter">Publish Achievement</h3>
                  </div>

                  <form onSubmit={handlePostAchievement} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Identity</label>
                      <input required placeholder="STUDENT NAME" className="w-full bg-gray-50 p-5 rounded-2xl font-black text-xs uppercase outline-none border-2 border-transparent focus:border-[#F38137] focus:bg-white transition-all" value={newAchievement.student_name} onChange={e => setNewAchievement({ ...newAchievement, student_name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Academic Score</label>
                        <input required placeholder="E.G. 98% OR A+" className="w-full bg-gray-50 p-5 rounded-2xl font-black text-xs uppercase outline-none focus:bg-white focus:border-[#F38137] border-2 border-transparent transition-all" value={newAchievement.score} onChange={e => setNewAchievement({ ...newAchievement, score: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mentor UID</label>
                        <input required type="number" placeholder="ID" className="w-full bg-gray-50 p-5 rounded-2xl font-black text-xs uppercase outline-none focus:bg-white focus:border-[#F38137] border-2 border-transparent transition-all" value={newAchievement.teacher_id} onChange={e => setNewAchievement({ ...newAchievement, teacher_id: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Topic / Subject</label>
                      <input required placeholder="MATHEMATICS, PHYSICS, ETC." className="w-full bg-gray-50 p-5 rounded-2xl font-black text-xs uppercase outline-none focus:bg-white focus:border-[#F38137] border-2 border-transparent transition-all" value={newAchievement.subject} onChange={e => setNewAchievement({ ...newAchievement, subject: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">The Success Story</label>
                      <textarea required placeholder="DESCRIBE THE MILESTONE ACHIEVED..." className="w-full bg-gray-50 p-5 rounded-2xl font-medium text-xs h-32 outline-none resize-none focus:bg-white focus:border-[#F38137] border-2 border-transparent transition-all" value={newAchievement.detail} onChange={e => setNewAchievement({ ...newAchievement, detail: e.target.value })} />
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Card Style</span>
                      <div className="flex gap-3">
                        {['bg-[#FFD97D]', 'bg-[#D4F1E8]', 'bg-[#D7E3FC]'].map(c => (
                          <button key={c} type="button" onClick={() => setNewAchievement({ ...newAchievement, color_theme: c })} className={`w-8 h-8 rounded-full ${c} border-2 ${newAchievement.color_theme === c ? 'border-black scale-110' : 'border-white opacity-60'} transition-all`}></button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#0F172A] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[3px] shadow-xl hover:bg-[#F38137] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95">
                      Publish Achievement <Plus size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ACCOUNTS TABLE (Unchanged) */
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-8 font-black uppercase text-[10px] tracking-widest text-gray-400">User</th>
                  <th className="p-8 font-black uppercase text-[10px] tracking-widest text-gray-400">Role</th>
                  <th className="p-8 font-black uppercase text-[10px] tracking-widest text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                  <tr key={user.id} className="hover:bg-[#f0f9f9]/30 transition-all group">
                    <td className="p-8 cursor-pointer" onClick={() => handleViewProfile(user.id, user.role)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${user.role === 'teacher' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{user.email.charAt(0).toUpperCase()}</div>
                        <div><p className="font-black text-sm uppercase text-[#0F172A] group-hover:text-[#1F6666]">{user.email}</p><p className="text-[9px] font-bold text-gray-300 tracking-widest">ID: {user.id}</p></div>
                      </div>
                    </td>
                    <td className="p-8"><span className={`px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-widest ${user.role === 'teacher' ? 'bg-[#1F6666] text-white' : 'bg-[#0F172A] text-white'}`}>{user.role}</span></td>
                    <td className="p-8 text-right"><button onClick={() => handleToggleStatus(user.id)} className={`px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all ${user.is_verified ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}>{user.is_verified ? 'Revoke' : 'Verify'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* PROFILE DETAIL MODAL (Unchanged) */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedProfile(null)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500"><X size={32} /></button>
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-gray-100">
              <div className="w-24 h-24 rounded-[2rem] bg-gray-50 overflow-hidden border-4 border-emerald-50">
                {selectedProfile.profile_picture ? <img src={selectedProfile.profile_picture} className="w-full h-full object-cover" /> : <UserCircle size={96} className="text-gray-200" />}
              </div>
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-[#0F172A] leading-none mb-2">{selectedProfile.full_name}</h3>
                <span className="bg-emerald-50 text-[#1F6666] px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">{selectedProfile.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-10">
              {selectedProfile.role === 'teacher' ? (
                <>
                  <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject</p><p className="font-black text-[#0F172A] uppercase">{selectedProfile.subject}</p></div>
                  <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Experience</p><p className="font-black text-[#0F172A] uppercase">{selectedProfile.experience_years} Years</p></div>
                  <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Rate</p><p className="font-black text-emerald-600 uppercase">₹{selectedProfile.monthly_rate}/mo</p></div>
                  <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p><p className="font-black text-[#0F172A] uppercase">{selectedProfile.city || 'Remote'}</p></div>
                </>
              ) : (
                <>
                  <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Class</p><p className="font-black text-[#0F172A] uppercase">{selectedProfile.grade_class}</p></div>
                  <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">City</p><p className="font-black text-[#0F172A] uppercase">{selectedProfile.city || 'N/A'}</p></div>
                </>
              )}
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl mb-8"><p className="text-[9px] font-black text-gray-400 uppercase mb-2">Biography</p><p className="text-gray-600 text-sm italic font-medium">"{selectedProfile.bio || "No data provided."}"</p></div>
            <button onClick={() => setSelectedProfile(null)} className="w-full bg-[#0F172A] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs">Close View</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;