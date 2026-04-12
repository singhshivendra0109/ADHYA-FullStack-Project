import React, { useState, useEffect } from 'react';
import { User, MapPin, GraduationCap, Settings, X, BookOpen, ShieldCheck, Clock, Camera, Plus, Star, MessageSquare } from 'lucide-react';
import api from '../api/api';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [formData, setFormData] = useState({ full_name: '', grade_class: '', city: '', profile_picture: '' });
  const [reviewData, setReviewData] = useState({ teacher_id: null, booking_id: null, rating: 5, comment: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const pRes = await api.get('/student/me');
      setProfile(pRes.data);
      setFormData(pRes.data);

      const bRes = await api.get('/student/my-bookings');
      setBookings(bRes.data);
    } catch (err) {
      console.log("Initialization: Profile record might be missing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!profile) await api.post('/student/', formData);
      else await api.patch('/student/me', formData);
      setShowUpdateModal(false);
      fetchData();
    } catch (err) { alert("Save failed."); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', reviewData);
      alert("Review posted!");
      setShowReviewModal(false);
    } catch (err) { alert(err.response?.data?.detail || "Review failed."); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#1F6666]">ADHYA SYNC...</div>;

  return (
    <div className="min-h-screen bg-[#fcfefd] pb-24 text-left font-sans">


      <section className="relative pt-48 pb-32 bg-[#1F6666] text-white rounded-b-[5rem] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 md:px-14 relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-12">

            <div className="flex flex-col md:flex-row items-center gap-10">

              <div className="w-48 h-48 rounded-[3.5rem] border-4 border-white/30 bg-white/10 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-md">
                {profile?.profile_picture ? (
                  <img src={profile.profile_picture} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={72} className="opacity-40" />
                )}
              </div>

              <div className="text-center md:text-left">

                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                  {profile?.full_name || "New Learner"}
                </h1>


                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <span className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-[2rem] text-sm font-black uppercase tracking-[2px] border border-white/20 shadow-lg">
                    <GraduationCap size={22} className="text-emerald-300" />
                    {profile?.grade_class || "Academic Class"}
                  </span>
                  <span className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-8 py-4 rounded-[2rem] text-sm font-black uppercase tracking-[2px] border border-white/20 shadow-lg">
                    <MapPin size={22} className="text-orange-300" />
                    {profile?.city || "Location"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowUpdateModal(true)}
              className="bg-white text-[#1F6666] px-12 py-6 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-[#0F172A] hover:text-white transition-all active:scale-95 whitespace-nowrap"
            >
              {profile ? "Edit Records" : "Setup Profile"}
            </button>
          </div>
        </div>
      </section>

      {/* 2. MENTORS LIST */}
      <div className="container mx-auto px-6 md:px-14 mt-24">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[#0F172A] mb-12">My <span className="text-[#1F6666]">Mentors</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white p-10 rounded-[3.5rem] border border-emerald-50 shadow-sm hover:shadow-2xl transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-[#f1fcf9] rounded-[1.5rem] flex items-center justify-center text-[#1F6666]"><BookOpen size={32} /></div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full border ${b.status === 'accepted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>{b.status}</span>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[4px] text-gray-300 mb-2">{b.subject}</h4>
              <h3 className="text-2xl font-black text-[#0F172A] mb-8">Mentorship Session</h3>

              {b.status === 'accepted' && (
                <button
                  onClick={() => {
                    setReviewData({ ...reviewData, teacher_id: b.teacher_id, booking_id: b.id });
                    setShowReviewModal(true);
                  }}
                  className="w-full bg-[#f1fcf9] text-[#1F6666] py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#1F6666] hover:text-white transition-all shadow-sm"
                >
                  <MessageSquare size={14} /> Leave A Review
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 text-left">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><X size={32} /></button>
            <h3 className="text-3xl font-black uppercase text-[#1F6666] mb-10">Mentor Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Rating (1-5)</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button key={num} type="button" onClick={() => setReviewData({ ...reviewData, rating: num })} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${reviewData.rating === num ? 'bg-[#1F6666] text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>{num}</button>
                  ))}
                </div>
              </div>
              <textarea required rows="4" className="w-full p-6 rounded-[2rem] bg-gray-50 border border-gray-100 font-bold outline-none focus:border-[#1F6666]" placeholder="Share your experience..." value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} />
              <button type="submit" className="w-full bg-[#1F6666] text-white py-6 rounded-[2rem] font-black uppercase tracking-[3px] shadow-xl">Submit Review</button>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE MODAL */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 text-left">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl relative">
            <button onClick={() => setShowUpdateModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><X size={32} /></button>
            <h3 className="text-3xl font-black uppercase text-[#1F6666] mb-8">Academic Records</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Full Name</label>
                  <input required className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:border-[#1F6666]" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Grade / Class</label>
                  <input required className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:border-[#1F6666]" value={formData.grade_class} onChange={(e) => setFormData({ ...formData, grade_class: e.target.value })} />
                </div>
                <div className="col-span-full">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">City</label>
                  <input required className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:border-[#1F6666]" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#1F6666] text-white py-6 rounded-[2rem] font-black uppercase shadow-xl">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;