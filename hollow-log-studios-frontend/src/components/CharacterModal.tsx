import React from 'react';
import { X, Youtube, ShoppingBag } from 'lucide-react';
import { Character } from '@/types';

interface CharacterModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ character, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleYouTubeClick = () => {
    const url = character.youtube_url || 'https://www.youtube.com/@Hollowlogstudios';
    window.open(url, '_blank');
  };

  const handleStoreClick = () => {
    const url = character.printful_store_url || 'https://hollowlogstudios.printful.me/';
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl griffy-text">{character.name}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {character.image_url && (
            <div className="text-center">
              <img 
                src={character.image_url} 
                alt={character.name}
                className="max-w-full h-auto rounded-lg mx-auto"
              />
            </div>
          )}
          
          <div className="space-y-3">
            {character.bio && (
              <div>
                <h3 className="text-xl font-semibold griffy-text mb-2">Bio</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{character.bio}</p>
              </div>
            )}
            
            {character.description && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Description:</h4>
                <p className="text-gray-700">{character.description}</p>
              </div>
            )}

            {character.artist_notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Artist's Notes:</h4>
                <p className="text-gray-700 italic">{character.artist_notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button 
                onClick={handleYouTubeClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Youtube className="h-4 w-4" />
                Watch Videos
              </button>
              <button 
                onClick={handleStoreClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ShoppingBag className="h-4 w-4" />
                Visit Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};