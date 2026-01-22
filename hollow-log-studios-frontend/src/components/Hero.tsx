import React from 'react';
import { Button } from '@/components/ui/button';
import { Book } from '@/types';
import { Eye, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  featuredBook?: Book | null;
  onViewBookDetails?: () => void;
}

const Hero: React.FC<HeroProps> = ({ featuredBook, onViewBookDetails }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const autographedPrice = 37.99;

  const handleAddToCart = () => {
    if (featuredBook) {
      addToCart({
        id: `${featuredBook.id}-autographed`,
        title: `${featuredBook.title} (Autographed)`,
        price: autographedPrice,
        image_url: featuredBook.image_url,
        type: 'book'
      });
    }
  };

  const handleShopNow = () => {
    navigate('/gallery');
  };

  const handleCommissionArt = () => {
    navigate('/commissions');
  };

  return (
    <section className="relative bg-green-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold font-griffy text-green-800 mb-4">
              Watercolor Fairy Tale Art
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Bringing diverse cultures and magical worlds to life through exquisite watercolor paintings, custom illustrations, and breathtaking murals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                className="bg-[#238830] hover:bg-green-700 text-white px-6 py-2"
                onClick={handleShopNow}
              >
                Shop Now
              </Button>
              <Button 
                variant="outline" 
                className="border-[#238830] text-[#238830] hover:bg-green-50 px-6 py-2"
                onClick={handleCommissionArt}
              >
                Commission Art
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            {featuredBook && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                <div className="text-[#238830] font-semibold mb-2 font-griffy">Featured Book</div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <img 
                      src={featuredBook.image_url} 
                      alt={featuredBook.title} 
                      className="w-full h-auto rounded-md shadow-sm"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-bold mb-2 font-griffy text-green-800">{featuredBook.title}</h3>
                    {featuredBook.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{featuredBook.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="border-[#238830] text-[#238830] hover:bg-green-50 flex items-center gap-1"
                        onClick={onViewBookDetails}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button 
                        className="bg-[#238830] hover:bg-green-700 text-white flex items-center gap-1"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;