
import React from 'react';
import StudentHeader from '../components/StudentHeader';
import Hero from '../components/Hero';
import SubjectSlider from '../components/SubjectSlider';
import HowItWorks from '../components/HowItWorks';
import FeaturedTutors from '../components/FeaturedTutors';
import SuccessWall from '../components/SuccessWall';
import Footer from '../components/Footer';
import ReviewSlider from '../components/ReviewSlider';
import FilterBar from '../components/FilterBar';

const StudentDashboard = () => {
  return (
    <main className="overflow-hidden bg-[#f7fdfd]">

      <StudentHeader />


      <Hero />


      <HowItWorks />


      <div className="bg-gray-50/30 pt-24 pb-12">
        <FilterBar />
        <FeaturedTutors />
      </div>


      <SuccessWall />


      <ReviewSlider />


      <Footer />
    </main>
  );
};

export default StudentDashboard;