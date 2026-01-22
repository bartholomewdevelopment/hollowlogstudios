import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AboutArtist from '@/components/AboutArtist';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AboutArtist />
      <Footer />
    </div>
  );
};

export default AboutPage;
