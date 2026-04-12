import React, { useState } from 'react';
import { GraduationCap, Menu, X, LogOut, Activity, Calendar, BarChart3 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

const TeacherHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const navLinks = [
    { name: 'Admission Requests', id: 'requests', icon: Activity },
    { name: 'Live Schedules', id: 'schedule', icon: Calendar },
    { name: 'Stats', id: 'stats', icon: BarChart3 }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7fdfd]/90 backdrop-blur-xl border-b border-gray-100">
      <div className="w-full mx-auto px-6 lg:px-12">
        { }
        <div className="flex items-center justify-between h-20 lg:h-24">

          { }
          <Link to="/teacher-dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2D8B8B] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl lg:text-2xl font-black text-[#1a2e2e] tracking-tighter uppercase leading-none">ADHYA</span>
              <span className="text-[9px] font-bold text-[#2D8B8B] tracking-[2px] uppercase mt-0.5">Mentor</span>
            </div>
          </Link>

          {/* 2. Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-[18px] font-black text-[#4a6363] uppercase tracking-[2px] hover:text-[#2D8B8B] transition-colors relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2D8B8B] transition-all group-hover:w-full rounded-full"></span>
              </button>
            ))}
          </nav>

          {/* 3. Action Buttons  */}
          <div className="hidden xl:flex items-center">
            <button
              onClick={handleLogout}
              className="bg-white border border-[#2D8B8B]/20 text-[#2D8B8B] px-6 py-3 rounded-full font-black uppercase tracking-[1px] text-[18px] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="xl:hidden p-2.5 text-[#2D8B8B] bg-white rounded-xl border border-gray-100 shadow-sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile View */}
        {isMenuOpen && (
          <div className="xl:hidden fixed inset-0 bg-white/98 backdrop-blur-3xl z-[100] p-6 flex flex-col justify-center animate-in fade-in zoom-in-95">
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-[#2D8B8B]"><X size={32} /></button>
            <div className="flex flex-col gap-6 text-center w-full">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-lg font-black uppercase tracking-[3px] text-[#4a6363] py-4 border-b border-gray-50 flex items-center justify-center gap-3"
                >
                  <link.icon size={20} className="text-[#2D8B8B]" />
                  {link.name}
                </button>
              ))}
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full py-5 text-red-500 font-black border-2 border-red-50 rounded-2xl text-base uppercase flex items-center justify-center gap-2"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TeacherHeader;