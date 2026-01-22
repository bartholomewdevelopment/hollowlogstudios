import React from 'react';
import { X, Youtube, ShoppingBag } from 'lucide-react';
import { Character } from '@/types';

interface CurrentCharacterModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

export const CurrentCharacterModal: React.FC<CurrentCharacterModalProps> = ({ 
  character, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen || !character) return null;

  const handleYouTubeClick = () => {
    const url = character.youtube_url || 'https://www.youtube.com/@Hollowlogstudios';
    window.open(url, '_blank');
  };

  const handleStoreClick = () => {
    const url = character.printful_store_url || 'https://hollowlogstudios.printful.me/';
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl griffy-text text-[#238830]">{character.name}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {character.image_url && (
            <div className="text-center">
              <img 
                src={character.image_url} 
                alt={character.name}
                className="max-w-full h-auto rounded-lg mx-auto shadow-lg"
              />
            </div>
          )}
          
          <div className="space-y-4">
            {character.bio && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold griffy-text mb-3 text-[#238830]">Bio</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{character.bio}</p>
              </div>
            )}
            
            {character.description && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Description:</h4>
                <p className="text-gray-700 leading-relaxed">{character.description}</p>
              </div>
            )}

            {character.artist_notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Artist's Notes:</h4>
                <p className="text-gray-700 italic leading-relaxed">{character.artist_notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button 
                onClick={handleYouTubeClick}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Youtube className="h-5 w-5" />
                Watch Videos
              </button>
              <button 
                onClick={handleStoreClick}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#238830] text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                Visit Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};