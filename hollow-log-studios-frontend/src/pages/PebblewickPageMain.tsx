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
      <section className="relative py-20 px-4 text-center sparkle-effect">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-pink-200/30 to-green-200/30 animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 griffy-text floating-sparkles">
            <div>The World of</div>
            <div>Pebblewick-by-the-Sea</div>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Welcome to Pebblewick-by-the-Sea, a place where hopes and dreams meet magic. 
            This seaside village rests between the water and a forest where magic takes flight.
          </p>
        </div>
      </section>

      {/* Current Characters Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 griffy-text floating-sparkles">
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
                  className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl sparkle-effect glitter-border floating-sparkles cursor-pointer w-full max-w-sm"
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
                      <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                        Current
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-2xl griffy-text text-center mb-3">
                      {character.name}
                    </CardTitle>
                    <p className="text-gray-600 text-center leading-relaxed">
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

      {/* Character Modal */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCharacter && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl griffy-text text-center">
                  {selectedCharacter.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={selectedCharacter.image_url || '/placeholder.svg'}
                    alt={selectedCharacter.name}
                    className="max-w-full h-auto rounded-lg mx-auto"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Character Bio</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCharacter.bio || selectedCharacter.description}</p>
                </div>
                {selectedCharacter.artist_notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Artist's Notes:</h4>
                    <p className="text-gray-700 italic">{selectedCharacter.artist_notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => window.open('https://www.youtube.com/@Hollowlogstudios', '_blank')}
                  >
                    <Youtube className="mr-2 h-4 w-4" />
                    Watch Videos
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open('https://hollowlogstudios.printful.me/', '_blank')}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Pebblewick Merch
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upcoming Characters Section - Only show if there are upcoming characters from admin */}
      {upcomingCharacters.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text">
              Upcoming Characters & Art
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
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
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl w-full max-w-sm"
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
                    <CardTitle className="text-lg griffy-text text-center mb-2">
                      {character.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 text-center line-clamp-2">
                      {character.description}
                    </p>
                    <div className="mt-3 text-center">
                      <Badge variant="outline">
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