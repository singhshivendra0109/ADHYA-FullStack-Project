
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Grid } from 'swiper/modules';
import {
  Calculator, FlaskConical, Languages, Code,
  Palette, Music, Globe, Microscope, Book,
  Atom, Pi, Library
} from "lucide-react";

import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const allSubjects = [
  { name: "Mathematics", icon: Calculator, tutors: "2,500+", color: "bg-emerald-100 text-emerald-700" },
  { name: "Physics", icon: Atom, tutors: "1,800+", color: "bg-cyan-100 text-cyan-700" },
  { name: "Languages", icon: Languages, tutors: "3,200+", color: "bg-teal-100 text-teal-700" },
  { name: "Programming", icon: Code, tutors: "1,500+", color: "bg-slate-200 text-slate-700" },
  { name: "Literature", icon: Book, tutors: "900+", color: "bg-lime-100 text-lime-700" },
  { name: "Music", icon: Music, tutors: "700+", color: "bg-green-100 text-green-700" },
  { name: "Arts", icon: Palette, tutors: "600+", color: "bg-mint-100 text-[#2D8B8B]" },
  { name: "Test Prep", icon: Library, tutors: "1,100+", color: "bg-sky-100 text-sky-700" },
  { name: "Biology", icon: Microscope, tutors: "1,400+", color: "bg-emerald-50 text-emerald-600" },
  { name: "Chemistry", icon: FlaskConical, tutors: "1,650+", color: "bg-teal-50 text-teal-600" },
  { name: "Statistics", icon: Pi, tutors: "800+", color: "bg-indigo-50 text-indigo-600" },
  { name: "Geography", icon: Globe, tutors: "1,200+", color: "bg-sage-100 text-sage-700" },
];

const SubjectSlider = () => {
  const navigate = useNavigate();

  const handleSubjectClick = (subjectName) => {
    // Navigates to home with the subject param and jumps to the section ID
    navigate(`/?subject=${encodeURIComponent(subjectName)}#featured-tutors`);

    // Manual smooth scroll fallback for instant response
    const element = document.getElementById('featured-tutors');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[#f1fcf9]" id="subjects">
      <div className="container mx-auto px-4 md:px-8">

        <div className="text-center mb-16 md:mb-24">
          <span className="text-[#F38137] font-black tracking-[4px] uppercase text-sm md:text-base">Subjects</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0F172A] mt-4 mb-6 leading-tight">
            Explore Any Subject
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto px-4 leading-relaxed">
            From academics to arts, find expert tutors in every field to help you master new skills and achieve your goals.
          </p>
        </div>

        <Swiper
          slidesPerView={1.2}
          grid={{ rows: 1, fill: 'row' }}
          spaceBetween={20}
          navigation={true}
          pagination={{ clickable: true }}
          modules={[Grid, Navigation, Pagination]}
          breakpoints={{
            640: { slidesPerView: 2, grid: { rows: 2 }, spaceBetween: 24 },
            1024: { slidesPerView: 4, grid: { rows: 2 }, spaceBetween: 30 },
          }}
          className="subject-swiper !pb-20"
        >
          {allSubjects.map((subject, index) => (
            <SwiperSlide key={index}>
              <div
                onClick={() => handleSubjectClick(subject.name)}
                className="group h-full bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-emerald-50 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] transition-all duration-500 cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[22px] md:rounded-[28px] ${subject.color} flex items-center justify-center mb-8 md:mb-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg shadow-emerald-900/5`}>
                  <subject.icon size={32} className="md:w-10 md:h-10" />
                </div>

                <h4 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-2">{subject.name}</h4>
                <p className="text-gray-400 font-bold text-sm md:text-base mb-6">{subject.tutors} expert tutors</p>

                <div className="mt-auto w-full pt-6 border-t border-emerald-50">
                  <span className="text-[#2D8B8B] font-black text-sm md:text-base inline-flex items-center gap-2 group-hover:translate-x-2 transition-all uppercase tracking-widest">
                    Browse <span>→</span>
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default SubjectSlider;