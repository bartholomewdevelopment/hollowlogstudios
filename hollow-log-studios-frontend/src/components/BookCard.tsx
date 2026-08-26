import React from 'react';
import { Button } from '@/components/ui/button';
import { Book } from '@/types';
import { Eye, Truck } from 'lucide-react';
import PreOrderBadge from '@/components/PreOrderBadge';

interface BookCardProps {
  book: Book;
  featured?: boolean;
  onViewDetails?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  featured = false,
  onViewDetails 
}) => {
  const { title, description, image_url } = book;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  // Format description to preserve line breaks for preview
  const formatDescription = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      <span key={index}>
        {paragraph}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div 
      className={`group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer ${featured ? 'md:flex' : ''}`}
      onClick={handleViewDetails}
    >
      <div className={`${featured ? 'md:w-2/5' : ''} relative`}>
        <img 
          src={image_url} 
          alt={title} 
          className="w-full h-auto object-contain max-h-[400px]" 
        />
      </div>
      <div className={`p-4 ${featured ? 'md:w-3/5 md:flex md:flex-col md:justify-center' : ''}`}>
        {featured && <div className="mb-2 text-[#238830] font-semibold">Featured Book</div>}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-800 group-hover:text-[#238830] transition-colors text-lg">{title}</h3>
          {book.pre_order && <PreOrderBadge className="mt-1 shrink-0" />}
        </div>
        {description && (
          <p className="text-gray-600 my-2 line-clamp-3">
            {formatDescription(description)}
          </p>
        )}
        <p className="text-gray-600 mb-2">Multiple purchase options available</p>
        
        {/* Shipping notice */}
        <div className="mb-3 p-2 bg-blue-50 rounded-md">
          <div className="flex items-center text-sm text-blue-800">
            <Truck className="mr-2 h-4 w-4" />
            <span>+ shipping from $4.95, based on order size</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-[#238830] text-[#238830] hover:bg-green-50 flex items-center gap-1 px-3 py-1 h-9"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <Eye className="h-4 w-4" />
            View Purchase Options
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;