import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SubjectSlider from '../components/SubjectSlider';
import HowItWorks from '../components/HowItWorks';
import FeaturedTutors from '../components/FeaturedTutors';
import SuccessWall from '../components/SuccessWall';
import Footer from '../components/Footer';
import ReviewSlider from '../components/ReviewSlider';

const Home = () => {
  return (
    //mobile swipe ke time page shake nahi karega
    <main className="overflow-hidden bg-[#f7fdfd]">

      <Header />
      <Hero />


      <div className="bg-white border-y border-gray-100/50">
        <SubjectSlider />
      </div>


      <HowItWorks />


      <div className="bg-gray-50/30">
        <FeaturedTutors />
      </div>


      <SuccessWall />



      <ReviewSlider />

      <Footer />
    </main>
  );
};

export default Home;    