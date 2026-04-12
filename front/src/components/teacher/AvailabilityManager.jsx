import React, { useState } from 'react';
import { Calendar, X, Clock, Plus } from 'lucide-react';

const AvailabilityManager = ({ slots, onDelete, onAddSlot }) => {
  // 1. Local state to manage time selection
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // 2. Helper function to format 24h input to 12h display (e.g. 14:00 -> 02:00 PM)
  const formatTo12Hr = (timeStr) => {
    let [hours, minutes] = timeStr.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    // Adding leading zero for consistency if needed, e.g. 09:00 AM
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    // Constructing the final time slot string
    const formattedSlot = `${formatTo12Hr(startTime)} - ${formatTo12Hr(endTime)}`;

    // 3. Calling the parent's function to actually add the slot
    if (onAddSlot) {
      onAddSlot(formattedSlot);
      // Reset to default after adding
      setStartTime("09:00");
      setEndTime("10:00");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Time Selection Header & Inputs */}
      <div className="bg-emerald-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-100 shadow-sm">
        <h3 className="text-[#2D8B8B] font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
          <Plus size={14} className="stroke-[3px]" /> Select New Time Slot
        </h3>

        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Start Time</label>
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white p-4 rounded-2xl border border-emerald-100/50 shadow-inner focus:ring-2 focus:ring-[#2D8B8B] outline-none font-black text-[#0F172A] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">End Time</label>
            <div className="relative">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white p-4 rounded-2xl border border-emerald-100/50 shadow-inner focus:ring-2 focus:ring-[#2D8B8B] outline-none font-black text-[#0F172A] cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full md:w-auto bg-[#2D8B8B] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#1f6666] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            Confirm Slot
          </button>
        </div>
      </div>

      {/* Active Slots Display */}
      <div className="space-y-4">
        <h3 className="text-[#0F172A] font-black uppercase tracking-widest text-[10px] ml-2 opacity-50">Active Slots</h3>
        {slots.length > 0 ? (
          slots.map((slot) => (
            <div key={slot.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#2D8B8B]">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-black text-[#0F172A] tracking-tight">{slot.time_slot}</h4>
                  <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">{slot.month_year || 'Current Session'}</p>
                </div>
              </div>
              <button
                onClick={() => onDelete(slot.id)}
                className="group text-red-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"
              >
                <X size={20} className="transition-transform group-hover:rotate-90" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-16 border-2 border-dashed border-emerald-100 rounded-[2.5rem] text-center text-emerald-200 bg-white/50">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-black uppercase text-[10px] tracking-[4px]">No active slots available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;