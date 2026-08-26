import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GalleryShop from '@/components/GalleryShop';

const GalleryPage: React.FC = () => {
  return (
    <div className="fairy-lattice min-h-screen bg-white">
      <Navbar />
      <div className="py-8 bg-green-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Gallery & Shop</h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse through Bethany's collection of whimsical watercolor paintings. 
            Originals and prints are available for purchase.
          </p>
        </div>
      </div>
      <GalleryShop />
      <Footer />
    </div>
  );
};

export default GalleryPage;
