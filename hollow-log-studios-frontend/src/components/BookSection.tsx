import React, { useState, useEffect } from 'react';
import { fetchBooks } from '@/firebase/bookService';
import { Book } from '@/types';
import BookCard from './BookCard';
import BookDetailModal from './BookDetailModal';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BookSection: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllBooks, setShowAllBooks] = useState(false);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchBooks();
        setBooks(data);
      } catch (err) {
        console.error('Failed to load books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBook(null), 300);
  };

  // Find featured book if any
  const featuredBook = books.find(book => book.featured);
  const regularBooks = books.filter(book => !book.featured);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 griffy-text">Books</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading books...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : books.length > 0 ? (
          <div className="space-y-10">
            {/* Featured Book */}
            {featuredBook && (
              <div className="mb-10">
                <BookCard 
                  book={featuredBook} 
                  featured={true} 
                  onViewDetails={handleViewDetails}
                />
              </div>
            )}
            
            {/* See More Books Button */}
            {regularBooks.length > 0 && (
              <div className="text-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAllBooks(!showAllBooks)}
                  className="border-[#238830] text-[#238830] hover:bg-green-50 flex items-center gap-2 mx-auto"
                >
                  {showAllBooks ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Other Books
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      See More Books
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* Regular Books - Collapsible */}
            {regularBooks.length > 0 && showAllBooks && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {regularBooks.map(book => (
                  <div key={book.id}>
                    <BookCard 
                      book={book} 
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No books available at the moment.</div>
        )}
      </div>

      {/* Book Detail Modal */}
      <BookDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        book={selectedBook}
      />
    </section>
  );
};

export default BookSection;