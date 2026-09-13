import React from 'react';
import { X, Youtube, ShoppingBag, Sparkles } from 'lucide-react';
import { Character } from '@/types';
import { displayImage } from '@/lib/webImage';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <X className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
        </button>

        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Image Section */}
          {character.image_url && (
            <div className="lg:w-1/2 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 lg:p-8 flex items-center justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                <img
                  src={displayImage(character)}
                  alt={character.name}
                  className="relative max-h-[50vh] lg:max-h-[70vh] w-auto object-contain rounded-xl shadow-xl"
                />
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className={`${character.image_url ? 'lg:w-1/2' : 'w-full'} overflow-y-auto`}>
            <div className="p-6 lg:p-8 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium tracking-wide uppercase">Character</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold griffy-text text-gray-900">
                  {character.name}
                </h2>
              </div>

              {/* Bio */}
              {character.bio && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-emerald-500 rounded-full" />
                    Story
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {character.bio}
                  </p>
                </div>
              )}

              {/* Description */}
              {character.description && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                  <p className="text-gray-700 leading-relaxed">
                    {character.description}
                  </p>
                </div>
              )}

              {/* Artist Notes */}
              {character.artist_notes && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <h4 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">
                      Artist's Notes
                    </h4>
                  </div>
                  <p className="text-amber-900/80 italic leading-relaxed">
                    "{character.artist_notes}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleYouTubeClick}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  <Youtube className="h-5 w-5" />
                  Watch Stories
                </button>
                <button
                  onClick={handleStoreClick}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Shop Merch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
