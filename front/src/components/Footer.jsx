import React from 'react';
import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white overflow-hidden">

      {/* Grand Call to Action Section */}
      <div className="bg-gradient-to-r from-[#2D8B8B] to-[#1F5F5F] py-20 md:py-28">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-10 leading-tight">
            Ready to Start Your <br className="hidden md:block" /> Learning Journey?
          </h2>

          <p className="text-emerald-50/80 text-sm md:text-lg font-bold">
            No credit card required • Free trial lesson • Cancel anytime
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-20 md:pt-32 pb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20 md:mb-28">

          {/* Brand Info */}
          <div className="flex flex-col items-center lg:items-start gap-8 text-center lg:text-left max-w-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] bg-[#F38137] flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white w-7 h-7 md:w-9 md:h-9" />
              </div>
              <span className="text-3xl md:text-4xl font-black tracking-tighter uppercase">ADHYA</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-base md:text-lg font-medium">
              Connecting students with world-class tutors for personalized, effective learning experiences. Your future starts here.
            </p>
          </div>

          {/* Contact & Headquarters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full lg:w-auto">

            {/* Phone */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#F38137]">
                <Phone size={24} />
              </div>
              <div className="text-center lg:text-left">
                <h4 className="font-black text-emerald-400 uppercase tracking-widest text-sm mb-2">Call Us</h4>
                <p className="text-gray-300 font-bold text-lg">+91 98765 43210</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#F38137]">
                <Mail size={24} />
              </div>
              <div className="text-center lg:text-left">
                <h4 className="font-black text-emerald-400 uppercase tracking-widest text-sm mb-2">Email Support</h4>
                <p className="text-gray-300 font-bold text-lg">support@adhya.com</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#F38137]">
                <MapPin size={24} />
              </div>
              <div className="text-center lg:text-left">
                <h4 className="font-black text-emerald-400 uppercase tracking-widest text-sm mb-2">Headquarters</h4>
                <p className="text-gray-300 font-bold text-lg leading-snug">
                  123 Learning Lane, <br />
                  Tech Park, Sector 62, <br />
                  Noida, UP - 201301
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-10 border-t border-white/5 text-center text-gray-500 text-sm md:text-base font-medium">
          © 2026 ADHYA Tutoring Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;