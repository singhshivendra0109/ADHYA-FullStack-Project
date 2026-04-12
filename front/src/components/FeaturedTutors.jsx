import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Star, CheckCircle, ArrowRight, X, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Grid } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const FeaturedTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const subjectFilter = searchParams.get('subject');
  const searchQuery = searchParams.get('search');
  const cityFilter = searchParams.get('city');
  const expFilter = searchParams.get('exp');
  const maxRateFilter = searchParams.get('maxRate');

  useEffect(() => {
    const getTutors = async () => {
      setLoading(true);
      try {
        const queryParams = {
          subject: subjectFilter,
          search: searchQuery,
          city: cityFilter,
          min_experience: expFilter,
          max_price: maxRateFilter
        };

        const response = await api.get('/profiles/all', { params: queryParams });
        let data = response.data;

        let verifiedTutors = data.filter(tutor => tutor.is_verified === true);

        if (searchQuery) {
          const lowerCaseQuery = searchQuery.toLowerCase();
          verifiedTutors = verifiedTutors.filter(tutor =>
            (tutor.full_name && tutor.full_name.toLowerCase().includes(lowerCaseQuery)) ||
            (tutor.subject && tutor.subject.toLowerCase().includes(lowerCaseQuery))
          );
        }

        if (subjectFilter) {
          verifiedTutors = verifiedTutors.filter(tutor =>
            tutor.subject && tutor.subject.toLowerCase() === subjectFilter.toLowerCase()
          );
        }

        setTutors(verifiedTutors);
        setLoading(false);
      } catch (err) {
        console.error("Connection failed:", err);
        setTutors([]);
        setLoading(false);
      }
    };
    getTutors();
  }, [subjectFilter, searchQuery, cityFilter, expFilter, maxRateFilter]);

  const clearFilters = () => setSearchParams({});

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center bg-[#f1fcf9]">
      <div className="w-16 h-16 border-4 border-[#2D8B8B] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-black text-[#2D8B8B] uppercase tracking-[4px] animate-pulse">Syncing ADHYA...</div>
    </div>
  );

  return (
    <section className="py-24 md:py-32 bg-[#f1fcf9] overflow-hidden" id="featured-tutors">
      <div className="max-w-[1500px] mx-auto px-4 md:px-10">

        <div className="text-center mb-16 md:mb-24 relative">
          <span className="text-[#F38137] font-black tracking-[4px] uppercase text-sm md:text-base">
            {(searchQuery || cityFilter || expFilter || maxRateFilter) ? `Filtered Results` : subjectFilter ? `${subjectFilter} Experts` : "Expert Mentors"}
          </span>
          <h2 className="text-4xl md:text-7xl font-black text-[#0F172A] mt-4 mb-6 leading-tight tracking-tighter uppercase">
            {searchQuery ? "Matched" : subjectFilter ? subjectFilter : "Featured"} <span className="text-[#2D8B8B]">Tutors</span>
          </h2>

          {(subjectFilter || searchQuery || cityFilter || expFilter || maxRateFilter) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 mx-auto bg-white border border-emerald-100 text-[#2D8B8B] px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all shadow-sm group"
            >
              <X size={14} className="group-hover:rotate-90 transition-transform" />
              Clear All Filters
            </button>
          )}
        </div>

        {tutors.length > 0 ? (
          <div className="relative group/swiper">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, Grid]}
              spaceBetween={35}
              slidesPerView={1}
              grid={{
                rows: 2,
                fill: 'row'
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              navigation={{
                nextEl: '.swiper-button-next-tutor',
                prevEl: '.swiper-button-prev-tutor',
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              breakpoints={{
                640: { slidesPerView: 2, grid: { rows: 2 } },
                1024: { slidesPerView: 2, grid: { rows: 2 } },
                1280: { slidesPerView: 3, grid: { rows: 2 } },
                1536: { slidesPerView: 4, grid: { rows: 2 } }
              }}
              className="pb-20 !px-2 !pt-4"
            >
              {tutors.map((tutor) => (
                <SwiperSlide key={tutor.id} className="!h-auto mb-12">
                  <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-15px_rgba(45,139,139,0.2)] transition-all duration-700 border border-emerald-50 flex flex-col group hover:-translate-y-2 h-full">

                    <div className="relative h-64 md:h-72 overflow-hidden">
                      <img
                        src={tutor.profile_picture || "https://images.unsplash.com/photo-1544717297-fa154daaf761?q=80&w=400&h=500&fit=crop"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        alt={tutor.full_name}
                      />
                      <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-xl text-white px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1 shadow-2xl uppercase tracking-widest">
                        <CheckCircle size={12} /> Verified
                      </div>
                      <div className="absolute bottom-4 left-4 bg-[#0F172A]/90 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                        <span className="text-[8px] font-black block leading-none text-emerald-400 uppercase tracking-widest mb-1">Monthly</span>
                        <span className="text-base font-black">₹{tutor.monthly_rate}</span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex-grow flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-xl font-black text-[#0F172A] mb-1 uppercase tracking-tight text-left truncate">{tutor.full_name}</h4>
                        <div className="flex justify-start">
                          <div className="inline-flex items-center gap-2 bg-emerald-50 text-[#2D8B8B] px-2 py-1 rounded-lg">
                            <span className="font-black text-[9px] uppercase tracking-widest">{tutor.subject}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 bg-[#f7fdfd] w-fit px-3 py-1.5 rounded-xl border border-emerald-50">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (<Star key={i} size={12} className="text-[#F38137] fill-[#F38137]" />))}
                        </div>
                        <span className="font-black text-xs text-[#0F172A]">{tutor.average_rating || "4.9"}</span>
                      </div>

                      <p className="text-gray-500 text-xs md:text-sm font-medium line-clamp-2 mb-6 leading-relaxed italic text-left">
                        "{tutor.bio || "Passionate educator dedicated to student success."}"
                      </p>

                      <div className="mt-auto pt-6 border-t border-emerald-50">
                        <button
                          onClick={() => navigate(`/tutor/${tutor.user_id}`)}
                          className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[2px] hover:bg-[#2D8B8B] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
                          Profile <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="swiper-button-prev-tutor absolute top-1/2 -left-4 lg:-left-16 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border border-emerald-50 text-[#2D8B8B] hover:bg-[#2D8B8B] hover:text-white transition-all -translate-y-1/2 opacity-0 group-hover/swiper:opacity-100">
              <ChevronLeft size={24} />
            </button>
            <button className="swiper-button-next-tutor absolute top-1/2 -right-4 lg:-right-16 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border border-emerald-100 text-[#2D8B8B] hover:bg-[#2D8B8B] hover:text-white transition-all -translate-y-1/2 opacity-0 group-hover/swiper:opacity-100">
              <ChevronRight size={24} />
            </button>
          </div>
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-8 rounded-[3rem] border border-dashed border-emerald-100 shadow-sm">
              <SearchX className="text-gray-200 mb-4 mx-auto" size={48} />
              <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-4">No tutors matched your search</p>
              <button onClick={clearFilters} className="text-[#F38137] font-black uppercase text-xs underline underline-offset-8 decoration-2">See all available tutors</button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .swiper-pagination-bullet { background: #cbd5e1; opacity: 1; width: 8px; height: 8px; }
        .swiper-pagination-bullet-active { background: #2D8B8B; width: 24px; border-radius: 4px; }
        .swiper-grid-column > .swiper-wrapper { flex-direction: row !important; }
      `}} />
    </section>
  );
};

export default FeaturedTutors;