import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById } from '@/firebase/bookService';
import { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import AppLayout from '@/components/AppLayout';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('Book ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const bookData = await getBookById(id);
        if (bookData) {
          setBook(bookData);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    if (book) {
      addToCart({
        id: book.id,
        title: book.title,
        price: book.price,
        image_url: book.image_url,
        type: 'book'
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6 flex items-center gap-2"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-lg">Loading book details...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <Button onClick={handleGoBack}>Go Back</Button>
            </div>
          </div>
        ) : book ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-center items-start">
              <img 
                src={book.image_url} 
                alt={book.title} 
                className="max-w-full rounded-lg shadow-md max-h-[600px] object-contain"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
              
              {book.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700">{book.description}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-xl font-semibold mb-2">Pricing</h2>
                <p className="text-2xl font-bold text-[#238830] mb-4">
                  {book.price ? `$${book.price}` : 'Price on request'}
                </p>
                
                {book.price && (
                  <Button 
                    className="bg-[#238830] hover:bg-green-700 text-white flex items-center gap-2 w-full md:w-auto" 
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <p className="text-lg">Book not found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BookDetailPage;
