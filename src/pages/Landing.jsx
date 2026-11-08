import React from 'react';
import Navbar from './landing-components/Navbar';
import Hero from './landing-components/Hero';
import ServicesSection from './landing-components/ServicesSection';
import WhyChooseUs from './landing-components/WhyChooseUs';
import OffersBanner from './landing-components/OffersBanner';
import Testimonials from './landing-components/Testimonials';
import TeamSection from './landing-components/TeamSection';
import Footer from './landing-components/Footer';

const Landing = () => {
  return (
    <div style={{ backgroundColor: '#FFF8FC', height: '100%', overflowY: 'auto', width: '100%', overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <ServicesSection />
      <WhyChooseUs />
      <OffersBanner />
      <Testimonials />
      <TeamSection />
      <Footer />
    </div>
  );
};

export default Landing;
