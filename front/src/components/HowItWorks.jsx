import React, { useState } from 'react';
import { Search, Calendar, Video, Award, X, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: "01",
    title: "Find Your Tutor",
    shortDesc: "Browse our community of expert mentors to find your perfect learning match.",
    fullDesc: "Our platform features a diverse network of verified educators. Use our smart filtering system to narrow down mentors by subject expertise, city, years of experience, and your specific budget. Every mentor undergoes a rigorous verification process to ensure quality instruction.",
    features: ["Advanced Filtering", "Verified Profiles", "Subject Specialists"],
    icon: Search,
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    id: "02",
    title: "Book a Session",
    shortDesc: "Choose a time that fits your schedule with our flexible booking system.",
    fullDesc: "Manage your learning journey at your own pace. View real-time availability for your chosen mentor and book sessions that align with your routine. Our system sends automated reminders so you never miss a milestone in your academic progress.",
    features: ["Real-time Availability", "Automated Reminders", "Flexible Scheduling"],
    icon: Calendar,
    color: "bg-teal-100 text-teal-700"
  },
  {
    id: "03",
    title: "Start Learning",
    shortDesc: "Connect with your mentor through our integrated learning tools.",
    fullDesc: "Engage in high-quality interactive sessions designed for clarity. Our platform provides the infrastructure needed for seamless communication, allowing you to ask questions, share resources, and receive personalized guidance directly from the experts.",
    features: ["Interactive Sessions", "Resource Sharing", "Direct Communication"],
    icon: Video,
    color: "bg-cyan-100 text-cyan-700"
  },
  {
    id: "04",
    title: "Achieve Your Goals",
    shortDesc: "Track your academic progress and reach your learning milestones.",
    fullDesc: "Success is a journey of consistency. ADHYA helps you track your growth over time. Mastery of new concepts becomes easier with dedicated support, feedback loops, and tailored learning paths that ensure you reach your full potential.",
    features: ["Progress Tracking", "Expert Feedback", "Milestone Rewards"],
    icon: Award,
    color: "bg-mint-100 text-[#2D8B8B]"
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(null);

  const openModal = (step) => setActiveStep(step);
  const closeModal = () => setActiveStep(null);

  return (
    <section className="py-24 md:py-32 bg-[#f1fcf9] overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-4 md:px-8">

        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24">
          <span className="text-[#F38137] font-black tracking-[4px] uppercase text-sm md:text-base">Process</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0F172A] mt-4 mb-6 leading-tight">
            Start Learning in Minutes
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto px-4 leading-relaxed font-medium">
            Getting started is easy. Follow these simple steps and begin your personalized learning journey today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 relative">
          <div className="hidden lg:block absolute top-24 left-10 right-10 h-1 bg-emerald-100/40 -z-0 rounded-full" />

          {steps.map((step, index) => (
            <div key={index} className="relative group z-10">
              <div
                onClick={() => openModal(step)}
                className="h-full bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-emerald-50 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] transition-all duration-500 cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left"
              >
                <span className="absolute -top-10 md:-top-14 left-8 text-6xl md:text-8xl font-black text-emerald-50/70 group-hover:text-emerald-100 transition-colors duration-500">
                  {step.id}
                </span>

                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[22px] md:rounded-[28px] ${step.color} flex items-center justify-center mb-8 md:mb-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg shadow-emerald-900/5`}>
                  <step.icon size={32} className="md:w-10 md:h-10" />
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-4">
                  {step.title}
                </h3>

                <p className="text-gray-500 font-medium text-sm md:text-base leading-relaxed">
                  {step.shortDesc}
                </p>

                <div className="mt-8 pt-6 border-t border-emerald-50 w-full">
                  <span className="text-[#2D8B8B] font-black text-sm md:text-base inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform uppercase tracking-widest">
                    Learn More <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PREMIUM MODAL OVERLAY --- */}
      {activeStep && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 md:top-10 md:right-10 p-3 rounded-full bg-gray-50 text-gray-400 hover:text-[#F38137] hover:bg-orange-50 transition-all z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-16">
              <div className={`w-16 h-16 rounded-2xl ${activeStep.color} flex items-center justify-center mb-8`}>
                <activeStep.icon size={32} />
              </div>

              <span className="text-[#F38137] font-black tracking-[4px] uppercase text-xs mb-2 block">
                Step {activeStep.id}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] mb-6 uppercase tracking-tighter">
                {activeStep.title}
              </h2>

              <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-10 italic">
                "{activeStep.fullDesc}"
              </p>

              <div className="space-y-4">
                <p className="font-black text-xs uppercase tracking-widest text-[#2D8B8B] mb-4">Key Features:</p>
                {activeStep.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="text-[#0F172A] font-bold text-sm md:text-base uppercase tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <button
                  onClick={closeModal}
                  className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[3px] hover:bg-[#2D8B8B] transition-all shadow-xl active:scale-95"
                >
                  Got It, Thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;