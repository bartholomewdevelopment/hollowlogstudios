import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Painting } from '@/types';
import { fetchPaintings } from '@/firebase/galleryService';
import MerchandiseSection from '@/components/MerchandiseSection';
import BookSection from '@/components/BookSection';
import MuralSection from '@/components/MuralSection';
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

  const getBadgeVariant = (tag: string) => {
    switch (tag) {
      case 'Original - For Sale':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Original - Sold Out':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Print - For Sale':
        return 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100';
      case 'Custom Artwork':
        return 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

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
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="overflow-hidden relative bg-green-50">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto object-contain max-h-72"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge key={index} className={getBadgeVariant(tag)}>
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="font-medium text-gray-800 group-hover:text-[#238830] transition-colors text-lg">{title}</h3>
        
        <div className="mt-2 space-y-1 mb-3">
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

const GalleryShop: React.FC = () => {
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadPaintings = async () => {
      try {
        setLoading(true);
        const data = await fetchPaintings();
        setPaintings(data);
        
        const allTags = new Set<string>();
        data.forEach(painting => {
          painting.tags?.forEach(tag => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags));
      } catch (err) {
        console.error('Failed to load paintings:', err);
        setError('Failed to load artwork. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPaintings();
  }, []);

  const filteredPaintings = tagFilter
    ? paintings.filter(painting => painting.tags.includes(tagFilter))
    : paintings;

  const handleViewDetails = (painting: Painting) => {
    setSelectedPainting(painting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPainting(null), 300);
  };

  return (
    <div className="py-12">
      <MerchandiseSection />
      <BookSection />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 id="artwork-section" className="text-3xl font-bold text-center mb-8 griffy-text">Artwork</h2>
          
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <Button
                variant={tagFilter === null ? 'default' : 'outline'}
                className={tagFilter === null ? 'bg-[#238830]' : 'border-[#238830] text-[#238830]'}
                onClick={() => setTagFilter(null)}
              >
                All Tags
              </Button>
              {availableTags.map(tag => (
                <Button
                  key={tag}
                  variant={tagFilter === tag ? 'default' : 'outline'}
                  className={tagFilter === tag ? 'bg-[#238830]' : 'border-[#238830] text-[#238830]'}
                  onClick={() => setTagFilter(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">Loading artwork...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredPaintings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPaintings.map((painting) => (
                <ArtworkCard 
                  key={painting.id} 
                  id={painting.id}
                  title={painting.title}
                  imageUrl={painting.image_url}
                  tags={painting.tags}
                  tagPrices={painting.tag_prices}
                  painting={painting}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {!tagFilter ? 
                'No artwork available at the moment.' : 
                'No artwork matches the selected tag.'}
            </div>
          )}
        </div>
      </section>

      <MuralSection />

      <ProductDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        painting={selectedPainting}
      />
    </div>
  );
};

export default GalleryShop;