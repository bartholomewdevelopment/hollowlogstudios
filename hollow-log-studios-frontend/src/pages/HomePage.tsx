import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CurrentCharacters from '@/components/CurrentCharacters';
import CurrentCryptids from '@/components/CurrentCryptids';
import FeaturedArtwork from '@/components/FeaturedArtwork';
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero 
        featuredBook={featuredBook}
        onViewBookDetails={featuredBook ? () => handleViewBookDetails(featuredBook) : undefined}
      />
      <CurrentCharacters />
      <CurrentCryptids />
      <FeaturedArtwork />
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