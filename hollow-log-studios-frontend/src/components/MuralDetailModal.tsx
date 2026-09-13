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
import { Mural } from '@/types';
import { displayImage } from '@/lib/webImage';

interface MuralDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mural: Mural | null;
}

const MuralDetailModal: React.FC<MuralDetailModalProps> = ({
  isOpen,
  onClose,
  mural,
}) => {
  if (!mural) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{mural.title}</DialogTitle>
          <DialogDescription>
            {mural.location && `Location: ${mural.location}`}
            {mural.year && mural.location && ' • '}
            {mural.year && `Year: ${mural.year}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md">
            <img
              src={displayImage(mural)}
              alt={mural.title}
              className="w-full max-h-[70vh] object-contain"
            />
          </div>
          
          {mural.description && (
            <div className="text-gray-700">
              {mural.description}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MuralDetailModal;
