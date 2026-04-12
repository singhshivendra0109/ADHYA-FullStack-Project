import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, RotateCcw, Filter, Search, BookOpen } from 'lucide-react';

const FilterBar = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [localFilters, setLocalFilters] = useState({
        city: searchParams.get('city') || '',
        exp: searchParams.get('exp') || '',
        maxRate: searchParams.get('maxRate') || '',
        subject: searchParams.get('subject') || ''
    });

    const subjects = [
        "Mathematics", "Physics", "Chemistry", "Biology",
        "Programming", "Languages", "Literature", "Music", "Arts"
    ];

    useEffect(() => {
        setLocalFilters({
            city: searchParams.get('city') || '',
            exp: searchParams.get('exp') || '',
            maxRate: searchParams.get('maxRate') || '',
            subject: searchParams.get('subject') || ''
        });
    }, [searchParams]);

    const handleInputChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        const newParams = new URLSearchParams(searchParams);
        const manageParam = (key, val) => {
            if (val) newParams.set(key, val);
            else newParams.delete(key);
        };
        manageParam('city', localFilters.city);
        manageParam('exp', localFilters.exp);
        manageParam('maxRate', localFilters.maxRate);
        manageParam('subject', localFilters.subject);
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setLocalFilters({ city: '', exp: '', maxRate: '', subject: '' });
        setSearchParams({});
    };

    return (
        /* 1. EXTENDED OUTER CONTAINER */
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 mb-20 relative z-30">

            {/* 2. FLEX CONTAINER*/}
            <div className="bg-white p-6 md:p-8 rounded-[3rem] md:rounded-[4rem] shadow-[0_30px_100px_rgba(45,139,139,0.12)] border border-emerald-50/50 flex items-center gap-4 lg:gap-6 justify-between overflow-x-auto no-scrollbar">


                <div className="flex items-center gap-5 px-6 border-r-2 border-emerald-50 shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-[#2D8B8B]/10 flex items-center justify-center text-[#2D8B8B]">
                        <Filter size={28} strokeWidth={2.5} />
                    </div>
                    <div className="hidden xl:block">
                        <p className="text-[11px] font-black uppercase tracking-[3px] text-[#F38137]">Refine</p>
                        <h3 className="text-lg font-black uppercase text-[#0F172A] tracking-tighter">Search</h3>
                    </div>
                </div>

                {/* 3. ALL IN ONE LINE */}
                <div className="flex flex-nowrap items-center gap-5 flex-1 min-w-0">

                    {/* Subject Filter */}
                    <div className="flex-1 min-w-[200px] flex items-center gap-4 bg-[#f1fcf9] px-6 py-5 rounded-[2rem] border border-emerald-100/50">
                        <BookOpen size={22} className="text-[#2D8B8B] shrink-0" />
                        <select
                            className="bg-transparent outline-none font-black text-xs md:text-sm uppercase tracking-widest text-[#0F172A] cursor-pointer w-full"
                            value={localFilters.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                        >
                            <option value="">SUBJECT</option>
                            {subjects.map(sub => (
                                <option key={sub} value={sub}>{sub.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Location Input  */}
                    <div className="flex-1 min-w-[180px] flex items-center gap-4 bg-[#f1fcf9] px-6 py-5 rounded-[2rem] border border-emerald-100/50">
                        <MapPin size={22} className="text-[#2D8B8B] shrink-0" />
                        <input
                            type="text"
                            placeholder="LOCATION..."
                            className="bg-transparent outline-none font-black text-xs md:text-sm uppercase tracking-widest text-[#0F172A] w-full"
                            value={localFilters.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Experience Select */}
                    <div className="flex-1 min-w-[180px] flex items-center gap-4 bg-[#f1fcf9] px-6 py-5 rounded-[2rem] border border-emerald-100/50">
                        <Briefcase size={22} className="text-[#2D8B8B] shrink-0" />
                        <select
                            className="bg-transparent outline-none font-black text-xs md:text-sm uppercase tracking-widest text-[#0F172A] cursor-pointer w-full"
                            value={localFilters.exp}
                            onChange={(e) => handleInputChange('exp', e.target.value)}
                        >
                            <option value="">EXPERIENCE</option>
                            <option value="1">1+ YEAR</option>
                            <option value="3">3+ YEARS</option>
                            <option value="5">5+ YEARS</option>
                        </select>
                    </div>

                    {/* Budget Select */}
                    <div className="flex-1 min-w-[180px] flex items-center gap-4 bg-[#f1fcf9] px-6 py-5 rounded-[2rem] border border-emerald-100/50">
                        <IndianRupee size={22} className="text-[#2D8B8B] shrink-0" />
                        <select
                            className="bg-transparent outline-none font-black text-xs md:text-sm uppercase tracking-widest text-[#0F172A] cursor-pointer w-full"
                            value={localFilters.maxRate}
                            onChange={(e) => handleInputChange('maxRate', e.target.value)}
                        >
                            <option value="">BUDGET</option>
                            <option value="1000">UNDER ₹1000</option>
                            <option value="3000">UNDER ₹3000</option>
                            <option value="5000">UNDER ₹5000</option>
                        </select>
                    </div>
                </div>

                {/* 4. ACTION BUTTONS */}
                <div className="flex items-center gap-4 shrink-0 border-l-2 border-emerald-50 pl-6 ml-2">
                    <button
                        onClick={clearFilters}
                        className="p-5 bg-gray-50 text-gray-400 rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all group shrink-0"
                        title="Reset Filters"
                    >
                        <RotateCcw size={24} className="group-hover:rotate-[-90deg] transition-transform duration-500" />
                    </button>

                    <button
                        onClick={handleSearch}
                        className="bg-[#0F172A] text-white px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-[3px] shadow-2xl hover:bg-[#2D8B8B] transition-all flex items-center justify-center gap-4 active:scale-95 shrink-0"
                    >
                        Search <Search size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;