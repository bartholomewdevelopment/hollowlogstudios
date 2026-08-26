import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AboutArtist from '@/components/AboutArtist';
import PastEvents from '@/components/PastEvents';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AboutArtist />
      <PastEvents />
      <Footer />
    </div>
  );
};

export default AboutPage;
