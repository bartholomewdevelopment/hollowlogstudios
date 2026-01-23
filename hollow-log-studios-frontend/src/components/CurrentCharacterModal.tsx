import React from 'react';
import { X, Youtube, ShoppingBag, Star } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop with blur and subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-pink-900/60 backdrop-blur-sm" />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/50 to-pink-50/50 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

        {/* Close Button - Floating */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <X className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
        </button>

        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Image Section - Whimsical gradient background */}
          {character.image_url && (
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6 lg:p-8 flex items-center justify-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-blue-200/40 blur-xl" />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-pink-200/40 blur-xl" />

              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                <img
                  src={character.image_url}
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
                <div className="flex items-center gap-2 text-purple-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium tracking-wide uppercase">Pebblewick Resident</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold griffy-text bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {character.name}
                </h2>
              </div>

              {/* Bio */}
              {character.bio && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                    Their Story
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {character.bio}
                  </p>
                </div>
              )}

              {/* Description */}
              {character.description && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                  <p className="text-gray-700 leading-relaxed">
                    {character.description}
                  </p>
                </div>
              )}

              {/* Artist Notes */}
              {character.artist_notes && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/30 rounded-full blur-xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <h4 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">
                        From the Artist
                      </h4>
                    </div>
                    <p className="text-amber-900/80 italic leading-relaxed">
                      "{character.artist_notes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleYouTubeClick}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-rose-600 transition-all duration-200"
                >
                  <Youtube className="h-5 w-5" />
                  Watch Stories
                </button>
                <button
                  onClick={handleStoreClick}
                  className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
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
