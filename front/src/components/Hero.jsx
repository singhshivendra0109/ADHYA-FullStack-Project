import React, { useState, useEffect } from 'react';
import { Search, Star, Users, Award } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Using your existing api instance

const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // New state for dynamic stats
  const [stats, setStats] = useState({
    total_tutors: 0,
    total_students: 0,
    average_rating: 0
  });

  // Fetch stats from database on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/hero-stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch platform stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;

    // 1. Update URL with search param and jump to the tutors section
    navigate(`/?search=${encodeURIComponent(query)}#featured-tutors`);

    // 2. Immediate scroll jump
    const element = document.getElementById('featured-tutors');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (

    <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-[#2D8B8B] via-[#1F5F5F] to-[#0F172A] text-white">


      <div className="absolute top-20 left-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-[100px] animate-pulse hidden md:block" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px]" />

      <div className="container mx-auto px-6 relative z-10 text-center">

        {/* Trusted Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 md:mb-8 shadow-xl">
          <Star className="w-3.5 h-3.5 text-[#F38137]" fill="currentColor" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Connect . Learn . Excel</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-5 md:mb-6 leading-[1.1] tracking-tight">
          Find Your Perfect <br className="hidden md:block" />
          <span className="text-emerald-300">Tutor Today</span>
        </h1>

        { }
        <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto mb-10 md:mb-12 px-4 leading-relaxed">
          Connect with expert tutors in any subject. Personalized learning that fits your schedule, goals, and learning style.
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12 md:mb-20">
          <div className="bg-white rounded-xl md:rounded-[26px] p-2 md:p-2.5 shadow-2xl flex flex-col md:flex-row gap-2 items-center border border-white/10">
            <div className="flex-1 flex items-center px-3 md:px-5 w-full gap-2 md:gap-3">
              <Search className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by tutor name or subject..."
                className="w-full py-3 md:py-4 bg-transparent text-[#0F172A] outline-none placeholder:text-gray-400 text-sm md:text-base font-bold"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-[#F38137] hover:bg-[#e06d2a] text-white px-8 py-3 md:py-4 rounded-lg md:rounded-[18px] font-black text-sm md:text-base transition-all shadow-lg active:scale-95 uppercase tracking-wider"
            >
              Find Tutors
            </button>
          </div>

          <p className="mt-3 md:mt-4 text-white/50 text-xs font-medium">
            Popular: <span className="text-white/80">Mathematics, Physics, English, Coding</span>
          </p>
        </div>

        {/* Stats Grid*/}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 max-w-4xl mx-auto pt-10 border-t border-white/10">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-400/80" />
              <span className="text-2xl md:text-4xl font-black">{stats.total_tutors}</span>
            </div>
            <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-[3px] font-bold">Expert Tutors</p>
          </div>

          <div className="flex flex-col items-center sm:border-x border-white/10 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-[#F38137]" fill="currentColor" />
              <span className="text-2xl md:text-4xl font-black">{stats.average_rating}</span>
            </div>
            <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-[3px] font-bold">Average Rating</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-emerald-400/80" />
              <span className="text-2xl md:text-4xl font-black">{stats.total_students}</span>
            </div>
            <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-[3px] font-bold">Students Joined</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;