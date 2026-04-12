import React from 'react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm text-left hover:shadow-md transition-all" >
    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
      <Icon className={color} size={24} />
    </div>
    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">{label}</p>
    <h3 className="text-3xl font-black text-[#0F172A]">{value}</h3>
  </div>
);

export default StatCard;