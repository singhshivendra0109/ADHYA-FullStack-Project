import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, Star, Clock, Plus,
  ShieldCheck, Mail, Settings, X, Check, Ban, User, Camera, BookOpen, MapPin, Briefcase, Info, GraduationCap,
  MessageSquare, Search
} from 'lucide-react';
import TeacherHeader from '../components/teacher/TeacherHeader';
import StatCard from '../components/StatCard';
import AvailabilityManager from '../components/teacher/AvailabilityManager';
import api from '../api/api';

const getCurrentMonthYear = () => {
  return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '', subject: '', bio: '', experience_years: 0, monthly_rate: 0, city: '', profile_picture: ''
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, bookingsRes, inboxRes] = await Promise.all([
        api.get('/profiles/me'),
        api.get('/bookings/incoming'),
        api.get('/chat/inbox')
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setFormData(profileRes.data);
        const slotsRes = await api.get(`/profiles/availability/${profileRes.data.user_id}`, {
          params: { month_year: getCurrentMonthYear() }
        });
        setAvailability(slotsRes.data);
      }
      setRequests(bookingsRes.data);
      setConversations(inboxRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleViewStudent = async (studentUserId) => {
    try {
      const res = await api.get(`/student/${studentUserId}`);
      setSelectedStudent(res.data);
    } catch (err) {
      alert("Could not load student profile details.");
    }
  };

  const handleApproveAdmission = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: "accepted" });
      alert("Admission Approved!");
      fetchDashboardData();
    } catch (err) {
      alert("Approval failed.");
    }
  };

  const handleAddSlot = async (formattedTimeString) => {
    try {
      const slotPayload = {
        month_year: getCurrentMonthYear(),
        time_slot: formattedTimeString
      };
      await api.post('/profiles/availability', slotPayload);
      alert("Slot successfully added!");
      fetchDashboardData();
    } catch (err) {
      console.error("Add slot failed:", err);
      alert(err.response?.data?.detail || "Failed to add slot.");
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.delete(`/profiles/availability/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const handleProfileSync = async (e) => {
    e.preventDefault();
    try {
      if (!profile) await api.post('/profiles/', formData);
      else await api.patch('/profiles/me', formData);
      setShowProfileModal(false);
      fetchDashboardData();
    } catch (err) { alert("Sync failed."); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#fcfefd]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#1F6666] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-[#1F6666] uppercase tracking-[4px] text-[10px]">Syncing Mentor Hub...</p>
      </div>
    </div>
  );

  return (
    <main className="bg-[#fcfefd] min-h-screen text-left font-sans">
      <TeacherHeader />

      <section className="relative pt-48 pb-32 bg-[#1F6666] text-white rounded-b-[5rem] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="container mx-auto px-6 md:px-14 relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 text-left">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-44 h-44 rounded-[3.5rem] border-4 border-white/30 bg-white/10 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-sm">
              {profile?.profile_picture ? <img src={profile.profile_picture} className="w-full h-full object-cover" alt="Mentor" /> : <User size={64} className="opacity-40" />}
            </div>
            <div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                {profile?.full_name?.split(' ')[0] || 'Mentor'}'s <br /><span className="text-emerald-400">Hub</span>
              </h1>
              <div className="flex items-center gap-3">
                {profile?.is_verified ? <ShieldCheck className="text-emerald-400" /> : <Clock className="text-orange-400" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{profile?.is_verified ? "Verified" : "Pending"}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowProfileModal(true)} className="bg-[#F38137] text-white px-12 py-6 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-900/20">Manage Profile</button>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-14 py-16">
        <div id="stats" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 scroll-mt-40">
          <StatCard icon={TrendingUp} label="Fee" value={`₹${profile?.monthly_rate || 0}`} color="text-emerald-500" />
          <StatCard icon={Users} label="Tribe" value={profile?.total_students || "0"} color="text-blue-500" />
          <StatCard icon={Star} label="Rating" value={profile?.average_rating || "5.0"} color="text-orange-500" />
          <StatCard icon={Clock} label="Slots" value={availability.length} color="text-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div id="requests" className="space-y-6 scroll-mt-40">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-[#0F172A]">Admission Requests</h2>
              <div className="bg-white rounded-[3rem] border border-emerald-50 p-8 shadow-sm space-y-6 min-h-[200px]">
                {requests.filter(r => r.status === 'pending' || r.status === 'accepted').length > 0 ? (
                  requests.filter(r => r.status === 'pending' || r.status === 'accepted').map((req) => (
                    <div key={req.id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 gap-6 transition-all hover:bg-white hover:shadow-md group">
                      <div className="flex items-center gap-5 text-left">
                        <button onClick={() => handleViewStudent(req.student_id)} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#1F6666] shadow-sm overflow-hidden hover:scale-110 hover:border-2 hover:border-[#F38137] transition-all">
                          {req.student_profile?.profile_picture ? <img src={req.student_profile.profile_picture} className="w-full h-full object-cover" alt="S" /> : <User size={24} />}
                        </button>
                        <div>
                          <h4 className="text-lg font-black text-[#0F172A] leading-none mb-1 uppercase">{req.student_name}</h4>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{req.subject} • {req.time_slot}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => navigate(`/messages/${req.student_id}`)} className="p-4 bg-white border border-gray-100 text-[#1F6666] rounded-2xl hover:bg-[#1F6666] hover:text-white transition-all shadow-sm active:scale-90">
                          <MessageSquare size={18} />
                        </button>
                        {req.status === 'pending' ? (
                          <button onClick={() => handleApproveAdmission(req.id)} className="w-full md:w-auto px-10 py-4 bg-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">Approve Admission</button>
                        ) : (
                          <div className="w-full md:w-auto px-10 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-blue-100 flex items-center gap-2 shadow-sm">
                            <ShieldCheck size={14} /> Enrolled
                          </div>
                        )}
                      </div>
                    </div>
                  ))) : (
                  <div className="py-12 flex flex-col items-center opacity-30">
                    <Mail className="text-gray-400 mb-2" size={40} />
                    <p className="text-gray-400 uppercase text-[10px] font-black tracking-widest italic">No Admissions Found</p>
                  </div>
                )}
              </div>
            </div>

            <div id="schedule" className="space-y-8 text-left scroll-mt-40">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#0F172A]">Live Schedule</h2>
                <button onClick={() => setShowSlotModal(true)} className="bg-[#1F6666] text-white p-4 rounded-2xl hover:scale-110 active:scale-95 shadow-xl transition-all"><Plus size={24} strokeWidth={3} /></button>
              </div>
              <div className="bg-white rounded-[3rem] border border-emerald-50 p-6 shadow-sm min-h-[150px]">
                <AvailabilityManager
                  slots={availability}
                  onDelete={handleDeleteSlot}
                  onAddSlot={handleAddSlot}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8 text-left">
            <div className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-10 blur-3xl group-hover:opacity-20 transition-all"></div>
              <h3 className="text-[10px] font-black mb-10 uppercase tracking-[4px] text-emerald-400">Monthly Pricing</h3>
              <h4 className="text-5xl font-black mb-6 tracking-tighter">₹{profile?.monthly_rate || '---'}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rate Per Student</p>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-emerald-50 shadow-xl space-y-8 relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[4px] text-[#1F6666]">Mentor Dossier</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-[#1F6666] shadow-sm"><BookOpen size={20} /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Subject</p><p className="text-lg font-black text-[#0F172A]">{profile?.subject}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm"><Briefcase size={20} /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Experience</p><p className="text-lg font-black text-[#0F172A]">{profile?.experience_years} Years</p></div>
                </div>
                <div className="pt-6 border-t border-gray-50 italic text-xs text-gray-400 font-bold leading-relaxed">"{profile?.bio || 'No bio shared yet.'}"</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3.5rem] border border-emerald-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[580px] relative">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#1F6666] rounded-xl text-white shadow-lg shadow-teal-900/20">
                    <MessageSquare size={16} />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[3px] text-[#0F172A]">Student Chats</h3>
                </div>
                <div className="bg-emerald-50 text-[#1F6666] text-[10px] font-black px-3 py-1 rounded-full">{conversations.length}</div>
              </div>

              <div className="relative mb-8 group">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1F6666] transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  className="w-full pl-13 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold outline-none focus:bg-white focus:border-[#1F6666]/20 focus:shadow-xl focus:shadow-emerald-900/5 transition-all duration-500 placeholder:text-gray-300"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {conversations
                  .filter(chat => chat.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => navigate(`/messages/${chat.other_user_id}`)}
                      className="group p-5 rounded-[2.5rem] flex items-center gap-5 cursor-pointer transition-all duration-300 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100/30 hover:-translate-y-1"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:rotate-3 group-hover:scale-110 transition-transform duration-500">
                          <img src={chat.other_user_pic || '/default-avatar.png'} className="w-full h-full object-cover" alt="S" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm"></div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-[13px] font-black uppercase truncate text-[#0F172A] group-hover:text-[#1F6666] transition-colors">{chat.other_user_name}</h4>
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                            {chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                          </span>
                        </div>
                        <p className="text-[11px] truncate text-gray-400 font-bold group-hover:text-gray-500 transition-colors">
                          {chat.last_message || "Start a session now..."}
                        </p>
                      </div>
                    </div>
                  ))}

                {conversations.filter(chat => chat.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="text-center py-20 animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No connections found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl p-10 relative text-left overflow-hidden border border-white/20">
            <button onClick={() => setSelectedStudent(null)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors"><X size={32} /></button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-4 border-[#1F6666]/10 shadow-inner overflow-hidden mb-4">
                {selectedStudent.profile_picture ? <img src={selectedStudent.profile_picture} className="w-full h-full object-cover" alt="S" /> : <User size={48} className="m-auto mt-8 text-gray-200" />}
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-[#0F172A] text-center">{selectedStudent.full_name}</h3>
              <p className="text-[10px] font-black uppercase text-[#1F6666] tracking-[3px] text-center mt-2">Academic Dossier</p>
            </div>
            <div className="space-y-4 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-500"><GraduationCap size={20} /></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Grade / Class</p><p className="text-lg font-black text-[#0F172A] uppercase leading-none">{selectedStudent.grade_class}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-500"><MapPin size={20} /></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">City / Location</p><p className="text-lg font-black text-[#0F172A] uppercase leading-none">{selectedStudent.city || 'Not Specified'}</p></div>
              </div>
            </div>
            <button onClick={() => setSelectedStudent(null)} className="w-full mt-8 bg-[#0F172A] text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#1F6666] transition-all">Close Details</button>
          </div>
        </div>
      )}

      {showSlotModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 text-left">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 relative text-[#0F172A]">
            <button onClick={() => setShowSlotModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500"><X size={28} /></button>
            <h3 className="text-2xl font-black uppercase mb-8">Add <span className="text-[#1F6666]">Session</span></h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddSlot(e.target.time_slot.value);
              setShowSlotModal(false);
            }} className="space-y-6">
              <input name="time_slot" required placeholder="e.g. 10:00 AM - 11:30 AM" className="w-full px-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:border-emerald-100 outline-none font-bold transition-all" />
              <button type="submit" className="w-full bg-[#0F172A] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs hover:bg-[#1F6666] transition-all shadow-xl shadow-teal-900/10">Confirm Slot</button>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 text-left">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl p-12 overflow-y-auto max-h-[90vh] relative text-[#0F172A]">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 z-10 transition-colors"><X size={32} /></button>
            <h3 className="text-4xl font-black uppercase text-center mb-12 tracking-tighter">Mentor <span className="text-[#1F6666]">Profile</span></h3>
            <form onSubmit={handleProfileSync} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-full flex flex-col items-center mb-6">
                <div className="relative w-28 h-28 rounded-[2.5rem] bg-gray-50 border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden hover:border-[#1F6666]/30 transition-all group">
                  {formData.profile_picture ? <img src={formData.profile_picture} className="w-full h-full object-cover" alt="Preview" /> : <Camera size={32} className="text-gray-200 group-hover:text-[#1F6666]/30 transition-colors" />}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData({ ...formData, profile_picture: reader.result });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-5">Full Name</label><input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-[#1F6666]/20 outline-none font-bold transition-all" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-5">Subject</label><input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-[#1F6666]/20 outline-none font-bold transition-all" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-5">Exp (Years)</label><input type="number" className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-[#1F6666]/20 outline-none font-bold transition-all" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-5">Monthly Fee (₹)</label><input type="number" required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-[#1F6666]/20 outline-none font-bold transition-all" value={formData.monthly_rate} onChange={(e) => setFormData({ ...formData, monthly_rate: parseInt(e.target.value) })} /></div>
              <div className="col-span-full space-y-1"><label className="text-[10px] font-black uppercase text-gray-400 ml-5">Bio</label><textarea rows="3" className="w-full px-8 py-6 rounded-[2.5rem] bg-gray-50 border-2 border-transparent focus:border-[#1F6666]/20 outline-none font-bold transition-all" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} /></div>
              <button type="submit" className="col-span-full bg-[#1F6666] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[3px] shadow-2xl shadow-teal-900/20 hover:-translate-y-1 active:scale-95 transition-all">Sync Hub Intelligence</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeacherDashboard;