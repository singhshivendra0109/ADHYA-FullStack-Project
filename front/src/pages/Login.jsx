import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

const Login = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Prepare form data for FastAPI OAuth2
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // 2. Login Request
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // 3. Extract Data from Response
      const { access_token, role, user_id } = response.data;

      // 4. Store in LocalStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('user_id', user_id);

      // 5. Update App State (Triggering Reactive Update for WebSocket)
      if (setCurrentUser) {
        setCurrentUser({
          id: user_id,
          role: role
        });
      }

      // 6. Role-Based Redirect
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }



    } catch (err) {
      setError(err.response?.data?.detail || "Invalid Credentials. Check your email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1fcf9] flex items-center justify-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-[440px] bg-white rounded-[2rem] md:rounded-[2.8rem] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] border border-emerald-50 p-8 md:p-12">

        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] bg-[#2D8B8B] flex items-center justify-center mb-5 shadow-2xl shadow-emerald-900/20 hover:scale-105 transition-transform duration-500">
            <GraduationCap className="w-7 h-7 text-white" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tighter uppercase text-center leading-tight">
            Welcome Back
          </h1>
          <p className="text-[#2D8B8B] font-black mt-3 uppercase tracking-[4px] text-[10px] md:text-xs text-center">
            Enter your ADHYA credentials
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 text-sm font-bold border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2D8B8B] group-focus-within:scale-110 transition-transform" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              className="w-full pl-12 pr-6 py-4 bg-emerald-50/30 border-2 border-transparent rounded-[1.2rem] focus:bg-white focus:border-[#2D8B8B]/20 outline-none transition-all font-bold text-[#0F172A] text-sm md:text-base"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2D8B8B] group-focus-within:scale-110 transition-transform" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              required
              value={password}
              className="w-full pl-12 pr-12 py-4 bg-emerald-50/30 border-2 border-transparent rounded-[1.2rem] focus:bg-white focus:border-[#2D8B8B]/20 outline-none transition-all font-bold text-[#0F172A] text-sm md:text-base"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D8B8B] transition-colors p-2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end px-4">
            <button type="button" className="text-xs md:text-sm font-black text-[#2D8B8B] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D8B8B] text-white py-4 rounded-[1.2rem] font-black uppercase tracking-[4px] text-xs shadow-2xl shadow-teal-900/40 hover:bg-[#1f6666] hover:-translate-y-1.5 transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login to Account"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-400 font-bold text-xs">
          New to the platform?{' '}
          <Link to="/signup" className="text-[#2D8B8B] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
            Join Adhya
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;