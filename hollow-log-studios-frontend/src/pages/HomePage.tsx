import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import UpcomingEvents from '@/components/UpcomingEvents';
import FeaturedArtwork from '@/components/FeaturedArtwork';
import Testimonials from '@/components/Testimonials';
import PublishedBooks from '@/components/PublishedBooks';
import OriginalWorlds from '@/components/OriginalWorlds';
import Representation from '@/components/Representation';
import Footer from '@/components/Footer';
import { getFeaturedBook } from '@/firebase/bookService';
import { Book } from '@/types';
import BookDetailModal from '@/components/BookDetailModal';
const HomePage: React.FC = () => {
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const loadFeaturedBook = async () => {
      try {
        const book = await getFeaturedBook();
        setFeaturedBook(book);
      } catch (err) {
        console.error('Failed to load featured book:', err);
      }
    };

    loadFeaturedBook();
  }, []);

  const handleViewBookDetails = (book: Book) => {
    setSelectedBook(book);
    setIsBookModalOpen(true);
  };

  const handleCloseBookModal = () => {
    setIsBookModalOpen(false);
    setTimeout(() => setSelectedBook(null), 300);
  };

  return (
    <div className="fairy-lattice min-h-screen bg-white">
      <Navbar />
      <Hero 
        featuredBook={featuredBook}
        onViewBookDetails={featuredBook ? () => handleViewBookDetails(featuredBook) : undefined}
      />
      <PublishedBooks />
      <OriginalWorlds />
      <UpcomingEvents />
      <FeaturedArtwork />
      <Testimonials />
      <Representation />
      <Footer />

      {/* Book Detail Modal */}
      <BookDetailModal 
        isOpen={isBookModalOpen}
        onClose={handleCloseBookModal}
        book={selectedBook}
      />
    </div>
  );
};

export default HomePage;