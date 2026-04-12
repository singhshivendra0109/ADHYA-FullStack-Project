import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const ReviewSlider = () => {
    const [reviews, setReviews] = useState([]);
    const [teacherMap, setTeacherMap] = useState({});
    const [studentMap, setStudentMap] = useState({});
    const [loading, setLoading] = useState(true);

    const cardColors = [
        'bg-[#FFD97D]', // Warm Yellow
        'bg-[#D4F1E8]', // Soft Mint
        'bg-[#D7E3FC]', // Periwinkle Blue
    ];

    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const [reviewsRes, teachersRes, studentsRes] = await Promise.all([
                    api.get('/reviews/'),
                    api.get('/profiles/all'),
                    api.get('/student/all-names')
                ]);
                const tMap = {};
                teachersRes.data.forEach(t => tMap[t.user_id] = t.full_name);
                const sMap = {};
                studentsRes.data.forEach(s => sMap[s.user_id] = s.full_name);
                setTeacherMap(tMap);
                setStudentMap(sMap);
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error("Review Sync Failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviewData();
    }, []);

    if (loading || reviews.length === 0) return null;

    return (
        <section className="py-24 md:py-32 bg-[#f1fcf9] overflow-hidden" id="testimonials">
            <div className="container mx-auto px-6">

                {/* 1. TOP SECTION: Centered Header Text */}
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <div className="flex justify-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={24} className="text-[#F38137] fill-[#F38137]" />
                        ))}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-[#0F172A] mb-6 leading-tight uppercase tracking-tighter">
                        The Perfect <span className="text-[#2D8B8B]">Match</span>
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed">
                        More than a million students gave <span className="text-[#0F172A] font-black underline decoration-[#F38137] decoration-4 underline-offset-4">5 stars</span> to their expert mentors at ADHYA.
                    </p>
                </div>

                {/* 2. MIDDLE SECTION: The Slider */}
                {/* We use !overflow-visible so cards can be seen as they slide past 
                    the container edges before being cut off by the section overflow */}
                <div className="relative h-[500px] mb-16">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1.2}
                        loop={true}
                        centeredSlides={true} // Keeps the main card in the absolute middle
                        autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                        }}
                        navigation={{
                            prevEl: '.review-prev-btn',
                            nextEl: '.review-next-btn',
                        }}
                        breakpoints={{
                            640: { slidesPerView: 1.5 },
                            1024: { slidesPerView: 2.2 },
                            1440: { slidesPerView: 2.8 },
                        }}
                        className="h-full !overflow-visible"
                    >
                        {reviews.map((review, index) => (
                            <SwiperSlide key={review.id} className="h-full">
                                <div className={`${cardColors[index % cardColors.length]} rounded-[3.5rem] p-10 md:p-12 h-full flex flex-col relative shadow-2xl border border-white/20 transition-transform duration-500 hover:scale-[1.02]`}>

                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.student_id}`}
                                                alt="User"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="text-left text-[#0F172A]">
                                            <h4 className="font-black text-xl leading-none mb-1 uppercase tracking-tight">
                                                {studentMap[review.student_id] || "Learner"}
                                            </h4>
                                            <p className="text-[10px] font-black uppercase tracking-[2px] opacity-60">Verified Student</p>
                                        </div>
                                    </div>

                                    <p className="text-[#0F172A] text-2xl md:text-3xl font-bold leading-tight text-left mb-auto italic">
                                        "{review.comment}"
                                    </p>

                                    <div className="mt-8">
                                        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl border border-white w-fit">
                                            <span className="font-black text-[11px] text-[#2D8B8B] uppercase tracking-widest">
                                                Mentor: {teacherMap[review.teacher_id]?.split(' ')[0] || "Adhya"}
                                            </span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className="text-[#F38137] fill-[#F38137]" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* 3. BOTTOM SECTION: Centered Navigation Buttons */}
                <div className="flex justify-center gap-6">
                    <button className="review-prev-btn w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#2D8B8B] hover:bg-[#2D8B8B] hover:text-white transition-all shadow-xl border border-emerald-100 group active:scale-95">
                        <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button className="review-next-btn w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#2D8B8B] hover:bg-[#2D8B8B] hover:text-white transition-all shadow-xl border border-emerald-100 group active:scale-95">
                        <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default ReviewSlider;