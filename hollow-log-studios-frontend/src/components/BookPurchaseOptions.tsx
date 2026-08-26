import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingCart, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Book } from '@/types';
import { autographedPrice, canAutograph } from '@/lib/bookPricing';

interface BookPurchaseOptionsProps {
  book: Book;
}

const BookPurchaseOptions: React.FC<BookPurchaseOptionsProps> = ({ book }) => {
  const { addToCart } = useCart();
  const offersAutograph = canAutograph(book);
  const signedPrice = book.price !== null ? autographedPrice(book.price) : null;

  const handleAddAutographedToCart = () => {
    if (signedPrice === null) return;
    addToCart({
      id: `${book.id}-autographed`,
      title: `${book.title} (Autographed)`,
      price: signedPrice,
      image_url: book.image_url,
      type: 'book'
    });
  };

  const handleAddStandardToCart = () => {
    if (book.price === null) return;
    addToCart({
      id: book.id,
      title: book.title,
      price: book.price,
      image_url: book.image_url,
      type: 'book'
    });
  };

  const handlePublisherLink = () => {
    if (book.publisher_link) {
      window.open(book.publisher_link, '_blank', 'noopener,noreferrer');
    }
  };

  const getPublisherButtonContent = () => {
    if (!book.publisher_available) {
      return null;
    }

    if (!book.publisher_in_stock) {
      return (
        <Button 
          disabled
          variant="outline"
          className="w-full border-red-500 text-red-500 bg-red-50 cursor-not-allowed opacity-75"
        >
          Coming Soon 2026
        </Button>
      );
    }

    return (
      <Button 
        onClick={handlePublisherLink}
        variant="outline"
        className="w-full border-[#238830] text-[#238830] hover:bg-green-50 flex items-center justify-center gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        Buy Now
      </Button>
    );
  };

  const getPublisherDescription = () => {
    if (!book.publisher_in_stock) {
      return "Coming soon from the publisher. Stay tuned for release updates!";
    }
    return "Purchase directly from the publisher. Standard retail pricing and shipping options available.";
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-3 griffy-text">Choose Your Purchase Option</h3>
        <p className="text-gray-600 mb-6">
          Get your copy of "{book.title}" in one of two ways:
        </p>
      </div>

      {/* Shipping notice */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-center text-sm text-blue-800">
          <Truck className="mr-2 h-4 w-4" />
          <span><strong>Note:</strong> shipping from $4.95, based on order size</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Publisher Option */}
        {book.publisher_available && (
          <div className="border border-gray-200 rounded-lg p-6 text-center space-y-4">
            <h4 className="font-semibold text-lg">From Publisher</h4>
            <p className="text-gray-600 text-sm">
              {getPublisherDescription()}
            </p>
            {getPublisherButtonContent()}
          </div>
        )}

        {/* Direct from the artist */}
        {book.website_cart_available && (
          <div className={`border border-[#238830] rounded-lg p-6 text-center space-y-4 bg-green-50 ${
            !book.publisher_available ? 'md:col-span-2' : ''
          }`}>
            <h4 className="font-semibold text-lg text-[#238830]">
              {offersAutograph ? 'Autographed Copy' : 'Buy from the Artist'}
            </h4>
            <p className="text-gray-600 text-sm">
              {offersAutograph
                ? 'Get a personally signed copy by Bethany Bartholomew. Perfect for collectors or as a special gift.'
                : 'Order your copy directly from Bethany. This title is not available autographed.'}
            </p>
            <p className="text-2xl font-bold text-[#238830]">
              {book.price === null
                ? 'Price on request'
                : `$${(offersAutograph ? signedPrice! : book.price).toFixed(2)}`}
            </p>
            {book.price !== null && (
              <Button 
                onClick={offersAutograph ? handleAddAutographedToCart : handleAddStandardToCart}
                className="w-full bg-[#238830] hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            )}
          </div>
        )}

        {/* No options available */}
        {!book.publisher_available && !book.website_cart_available && (
          <div className="md:col-span-2 border border-gray-200 rounded-lg p-6 text-center space-y-4">
            <h4 className="font-semibold text-lg text-gray-500">Currently Unavailable</h4>
            <p className="text-gray-600 text-sm">
              This book is not currently available for purchase. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPurchaseOptions;