import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Youtube, ShoppingBag } from 'lucide-react';
import UpcomingCharacters from '@/components/UpcomingCharacters';
import StoryVideos from '@/components/StoryVideos';
import { Character } from '@/types';
import { getCharactersByType } from '@/firebase/characterService';

const PebblewickPageMain: React.FC = () => {
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([]);
  const [upcomingCharacters, setUpcomingCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const allCharacters = await getCharactersByType('pebblewick');
        setCurrentCharacters(allCharacters.filter(c => c.status === 'current'));
        setUpcomingCharacters(allCharacters.filter(c => c.status === 'upcoming'));
      } catch (error) {
        console.error('Error loading Pebblewick characters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const handleCharacterClick = (character: Character, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCharacter(character);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="absolute right-[-8%] top-6 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.22),transparent_70%)] blur-2xl animate-[float_12s_ease-in-out_infinite]" />
        <div className="absolute left-[-6%] bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_70%)] blur-3xl animate-[float_14s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-slate-600">
              Pebblewick-by-the-Sea
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold griffy-text text-[#2a5b5a]">
              The World of Pebblewick
            </h1>
            <p className="mt-5 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
              A seaside village where hopes and dreams meet magic. Pebblewick rests between
              the water and a forest where wonder is always on the move.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-griffy text-[#2a5b5a]">Village Guide</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Discover the residents who keep the tides gentle and the woods glowing. Each character
              carries a story, a craft, and a bit of seaside sparkle.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-xl bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Locale</p>
                <p className="mt-1 font-semibold">Harbor + Forest</p>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mood</p>
                <p className="mt-1 font-semibold">Warm + Whimsical</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Characters Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 griffy-text floating-sparkles text-[#2a5b5a]">
            Meet Our Magical Characters
          </h2>
          {loading ? (
            <div className="text-center text-gray-600">Loading characters...</div>
          ) : currentCharacters.length > 0 ? (
            <div className={`flex flex-wrap justify-center gap-8 ${
              currentCharacters.length >= 3 ? 'lg:grid lg:grid-cols-3' : 
              currentCharacters.length === 2 ? 'lg:grid lg:grid-cols-2' : ''
            } ${
              currentCharacters.length >= 2 ? 'md:grid md:grid-cols-2' : ''
            }`}>
              {currentCharacters.map((character) => (
                <Card 
                  key={character.id} 
                  className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl sparkle-effect glitter-border floating-sparkles cursor-pointer w-full max-w-sm bg-white/85 border border-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
                  onClick={(e) => handleCharacterClick(character, e)}
                >
                  <CardHeader className="p-0 relative">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={character.image_url || '/placeholder.svg'} 
                        alt={character.name}
                        className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <Badge className="absolute top-2 left-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                        Current
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-2xl griffy-text text-center mb-3 text-[#2a5b5a]">
                      {character.name}
                    </CardTitle>
                    <p className="text-slate-600 text-center leading-relaxed">
                      {character.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No current characters available. Add some through the Admin Portal!
            </div>
          )}
        </div>
      </section>

      {/* Premium Whimsical Character Modal */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-white via-blue-50/30 to-pink-50/30 border-0 rounded-3xl shadow-2xl">
          {selectedCharacter && (
            <div className="flex flex-col lg:flex-row max-h-[90vh]">
              {/* Image Section */}
              {selectedCharacter.image_url && (
                <div className="lg:w-1/2 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6 lg:p-8 flex items-center justify-center relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-blue-200/40 blur-2xl" />
                  <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-pink-200/40 blur-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-200/30 blur-3xl" />

                  <div className="relative group">
                    <div className="absolute -inset-3 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-500" />
                    <img
                      src={selectedCharacter.image_url}
                      alt={selectedCharacter.name}
                      className="relative max-h-[40vh] lg:max-h-[65vh] w-auto object-contain rounded-xl shadow-xl"
                    />
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className={`${selectedCharacter.image_url ? 'lg:w-1/2' : 'w-full'} overflow-y-auto`}>
                <div className="p-6 lg:p-8 space-y-6">
                  {/* Title */}
                  <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-500">
                      <span className="text-lg">✨</span>
                      <span className="text-sm font-medium tracking-wide uppercase">Pebblewick Resident</span>
                    </div>
                    <DialogTitle className="text-3xl lg:text-4xl font-bold griffy-text bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {selectedCharacter.name}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Bio */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                      Their Story
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedCharacter.bio || selectedCharacter.description}
                    </p>
                  </div>

                  {/* Artist Notes */}
                  {selectedCharacter.artist_notes && (
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
                          "{selectedCharacter.artist_notes}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => window.open('https://www.youtube.com/@Hollowlogstudios', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-rose-600 transition-all duration-200"
                    >
                      <Youtube className="h-5 w-5" />
                      Watch Stories
                    </button>
                    <button
                      onClick={() => window.open('https://hollowlogstudios.printful.me/', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Shop Merch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upcoming Characters Section - Only show if there are upcoming characters from admin */}
      {upcomingCharacters.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-r from-emerald-50 via-sky-50 to-pink-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text text-[#2a5b5a]">
              Upcoming Characters & Art
            </h2>
            <p className="text-xl text-slate-600 text-center mb-12 max-w-3xl mx-auto">
              Peek behind the curtain at works in progress! These characters are still taking shape 
              in the magical realm of Pebblewick-by-the-Sea.
            </p>
            
            <div className={`flex flex-wrap justify-center gap-8 ${
              upcomingCharacters.length >= 3 ? 'lg:grid lg:grid-cols-3' : 
              upcomingCharacters.length === 2 ? 'lg:grid lg:grid-cols-2' : ''
            } ${
              upcomingCharacters.length >= 2 ? 'md:grid md:grid-cols-2' : ''
            }`}>
              {upcomingCharacters.map((character) => (
                <Card 
                  key={character.id}
                  className="cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl w-full max-w-sm bg-white/85 border border-white/70 shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
                  onClick={(e) => handleCharacterClick(character, e)}
                >
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={character.image_url || '/placeholder.svg'} 
                        alt={character.name}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg griffy-text text-center mb-2 text-[#2a5b5a]">
                      {character.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 text-center line-clamp-2">
                      {character.description}
                    </p>
                    <div className="mt-3 text-center">
                      <Badge variant="outline" className="border-emerald-400 text-emerald-700">
                        Coming Soon ✨
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Story Videos Section */}
      <StoryVideos />
    </>
  );
};

export default PebblewickPageMain;
