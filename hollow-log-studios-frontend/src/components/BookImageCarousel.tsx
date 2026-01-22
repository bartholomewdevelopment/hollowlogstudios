import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookImageCarouselProps {
  mainImage: string;
  galleryImages?: string[];
  title: string;
}

export function BookImageCarousel({ mainImage, galleryImages = [], title }: BookImageCarouselProps) {
  const allImages = [mainImage, ...galleryImages.filter(img => img.trim() !== '')];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (allImages.length === 1) {
    return (
      <div className="overflow-hidden rounded-md flex items-center justify-center">
        <img 
          src={mainImage} 
          alt={title} 
          className="max-w-full max-h-[400px] object-contain"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative overflow-hidden rounded-md flex items-center justify-center bg-gray-50">
        <img 
          src={allImages[currentIndex]} 
          alt={`${title} - Image ${currentIndex + 1}`} 
          className="max-w-full max-h-[400px] object-contain"
        />
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
      
      {/* Thumbnail Navigation */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                index === currentIndex ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <img 
                src={image} 
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}