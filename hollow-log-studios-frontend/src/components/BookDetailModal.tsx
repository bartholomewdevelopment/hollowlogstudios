import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Book } from '@/types';
import BookPurchaseOptions from './BookPurchaseOptions';
import { BookImageCarousel } from './BookImageCarousel';

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  if (!book) return null;

  // Format description to preserve line breaks and paragraphs
  const formatDescription = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-2 last:mb-0">
        {paragraph}
      </p>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold griffy-text">{book.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BookImageCarousel
            mainImage={book.image_url}
            galleryImages={book.gallery_images}
            title={book.title}
          />
          
          <div className="space-y-4">
            {book.description && (
              <DialogDescription className="text-base">
                {formatDescription(book.description)}
              </DialogDescription>
            )}
            
            <BookPurchaseOptions book={book} />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailModal;