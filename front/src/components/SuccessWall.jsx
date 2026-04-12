
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Trophy, Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

const SuccessWall = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    const cardColors = [
        'bg-[#FFD97D]', // Warm Yellow
        'bg-[#D4F1E8]', // Soft Mint
        'bg-[#D7E3FC]', // Periwinkle Blue
    ];

    useEffect(() => {
        const fetchHallOfFame = async () => {
            try {
                const response = await api.get('/achievements');
                setStories(response.data);
            } catch (err) {
                console.error("Success Wall Sync Failed:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHallOfFame();
    }, []);

    if (loading || stories.length === 0) return null;

    return (
        <section className="py-24 md:py-32 bg-[#f1fcf9] overflow-hidden" id="success-wall">
            <div className="container mx-auto px-6">

                {/* 1. TOP SECTION*/}
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <div className="flex justify-center gap-1 mb-6">
                        <Trophy className="text-[#F38137]" size={32} />
                    </div>
                    <span className="text-[#F38137] font-black tracking-[4px] uppercase text-xs mb-3 block">Hall of Fame</span>
                    <h2 className="text-5xl md:text-7xl font-black text-[#0F172A] mb-6 leading-tight uppercase tracking-tighter">
                        Student <span className="text-[#2D8B8B]">Success</span>
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed">
                        Exceptional achievements from our dedicated learners and their expert mentors.
                    </p>
                </div>

                {/* 2. MIDDLE SECTION */}
                <div className="relative h-[440px] mb-16">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1.2}
                        loop={true}
                        centeredSlides={true}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        navigation={{
                            prevEl: '.success-prev-btn',
                            nextEl: '.success-next-btn',
                        }}
                        breakpoints={{
                            640: { slidesPerView: 1.5 },
                            1024: { slidesPerView: 2.2 },
                            1440: { slidesPerView: 2.8 },
                        }}
                        className="h-full !overflow-visible"
                    >
                        {stories.map((story, index) => (
                            <SwiperSlide key={story.id} className="h-full">
                                {/* Card Body: Integrated the colorful logic with SuccessWall content */}
                                <div className={`${cardColors[index % cardColors.length]} rounded-[3.5rem] p-10 md:p-12 h-full flex flex-col items-center text-center relative shadow-2xl border border-white/20 transition-transform duration-500 hover:scale-[1.02]`}>

                                    {/* Trophy Header */}
                                    <div className="bg-white p-4 rounded-2xl shadow-sm text-[#F38137] mb-6">
                                        <Trophy size={28} />
                                    </div>

                                    {/* Student Name */}
                                    <h4 className="text-xl font-black text-[#0F172A] uppercase tracking-tight mb-4">
                                        {story.student_name}
                                    </h4>

                                    {/* Score Centerpiece */}
                                    <div className="py-6 mb-6 w-full border-y border-black/5 flex flex-col items-center justify-center">
                                        <span className="text-6xl font-black text-[#0F172A] leading-none mb-1">
                                            {story.score}
                                        </span>
                                        <span className="text-[#F38137] font-black text-[10px] uppercase tracking-[4px]">
                                            {story.subject}
                                        </span>
                                    </div>

                                    {/* Detail text */}
                                    <div className="relative px-2 mb-8 flex-grow">
                                        <Quote className="absolute -top-4 left-0 text-black/10" size={30} />
                                        <p className="text-[#0F172A] text-base font-bold leading-relaxed italic line-clamp-4">
                                            "{story.detail || "Outstanding performance and dedication to excellence."}"
                                        </p>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="w-full pt-8 border-t border-black/5">
                                        <div className="flex justify-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className="text-[#F38137] fill-[#F38137]" />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest bg-white/40 px-4 py-2 rounded-full border border-white/50">
                                            Mentor: <span className="text-[#2D8B8B]">{story.teacher_name}</span>
                                        </span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* 3. BOTTOM SECTION */}
                <div className="flex justify-center gap-6">
                    <button className="success-prev-btn w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#2D8B8B] hover:bg-[#2D8B8B] hover:text-white transition-all shadow-xl border border-emerald-100 group active:scale-95">
                        <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button className="success-next-btn w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#2D8B8B] hover:bg-[#2D8B8B] hover:text-white transition-all shadow-xl border border-emerald-100 group active:scale-95">
                        <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default SuccessWall;