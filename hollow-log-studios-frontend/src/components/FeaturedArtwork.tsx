import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Painting } from '@/types';
import { fetchFeaturedPaintings } from '@/firebase/galleryService';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import ProductDetailModal from '@/components/ProductDetailModal';

interface ArtworkCardProps {
  id: string;
  title: string;
  imageUrl: string;
  tags: string[];
  tagPrices?: Record<string, number>;
  painting: Painting;
  onViewDetails: (painting: Painting) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ 
  id, 
  title, 
  imageUrl, 
  tags, 
  tagPrices = {}, 
  painting, 
  onViewDetails 
}) => {
  const { addToCart } = useCart();
  
  const hasPrintPrice = tags.includes('Print - For Sale') && 
                       tagPrices && 
                       tagPrices['Print - For Sale'] !== undefined;
                       
  const hasOriginalPrice = tags.includes('Original - For Sale') && 
                          tagPrices && 
                          tagPrices['Original - For Sale'] !== undefined;

  const handleAddToCart = (variant: 'print' | 'original') => {
    let itemPrice = null;
    
    if (variant === 'print' && hasPrintPrice) {
      itemPrice = tagPrices['Print - For Sale'];
    } else if (variant === 'original' && hasOriginalPrice) {
      itemPrice = tagPrices['Original - For Sale'];
    }
    
    addToCart({
      id,
      title: `${title} (${variant === 'print' ? 'Print' : 'Original'})`,
      price: itemPrice,
      image_url: imageUrl,
      type: 'painting',
      variant
    });
  };

  return (
    <div className="group">
      <div className="aspect-square rounded-lg overflow-hidden mb-2 flex items-center justify-center bg-gray-100">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
      <h3 className="font-medium text-gray-800 group-hover:text-[#238830] transition-colors">{title}</h3>
      
      <div className="mt-2 space-y-1">
        {hasPrintPrice && (
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Print: ${tagPrices['Print - For Sale']}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 px-2 text-xs flex items-center gap-1 border-[#238830] text-[#238830] hover:bg-green-50" 
              onClick={() => handleAddToCart('print')}
            >
              <ShoppingCart className="h-3 w-3" />
              Add
            </Button>
          </div>
        )}
        
        {hasOriginalPrice && (
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Original: ${tagPrices['Original - For Sale']}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 px-2 text-xs flex items-center gap-1 border-[#238830] text-[#238830] hover:bg-green-50" 
              onClick={() => handleAddToCart('original')}
            >
              <ShoppingCart className="h-3 w-3" />
              Add
            </Button>
          </div>
        )}
        
        {!hasPrintPrice && !hasOriginalPrice && (
          <p className="text-gray-600">Price on request</p>
        )}
      </div>
      
      <div className="mt-2">
        <Button 
          variant="outline" 
          className="w-full border-[#238830] text-[#238830] hover:bg-green-50"
          onClick={() => onViewDetails(painting)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

const FeaturedArtwork: React.FC = () => {
  const [artworks, setArtworks] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadFeaturedPaintings = async () => {
      try {
        setLoading(true);
        const paintings = await fetchFeaturedPaintings();
        setArtworks(paintings);
      } catch (err) {
        console.error('Failed to load featured paintings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedPaintings();
  }, []);

  const handleViewDetails = (painting: Painting) => {
    setSelectedPainting(painting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPainting(null);
  };

  if (loading) {
    return null;
  }

  if (artworks.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-green-600 font-griffy">Featured Artwork</h2>
          <Link to="/gallery">
            <Button className="bg-[#238830] hover:bg-green-700 text-white">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <ArtworkCard 
              key={artwork.id} 
              id={artwork.id}
              title={artwork.title}
              imageUrl={artwork.image_url}
              tags={artwork.tags}
              tagPrices={artwork.tag_prices}
              painting={artwork}
              onViewDetails={handleViewDetails}
            />
          ))}  
        </div>
      </div>

      <ProductDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        painting={selectedPainting}
      />
    </section>
  );
};

export default FeaturedArtwork;