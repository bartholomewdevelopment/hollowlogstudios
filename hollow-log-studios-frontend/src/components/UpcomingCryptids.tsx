import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Youtube, ShoppingBag } from 'lucide-react';
import { Character } from '@/types';
import { getCharactersByType } from '@/firebase/characterService';
const UpcomingCryptids: React.FC = () => {
  const [upcomingCharacters, setUpcomingCharacters] = useState<Character[]>([]);
  const [selectedCryptid, setSelectedCryptid] = useState<Character | null>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const allCharacters = await getCharactersByType('cryptid');
        setUpcomingCharacters(allCharacters.filter(c => c.status === 'upcoming'));
      } catch (error) {
        console.error('Error loading upcoming cryptids:', error);
      }
    };
    loadCharacters();
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-gray-800/50 to-purple-800/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text text-white">
          Upcoming Alliance Members
        </h2>
        <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          More cryptids are joining the Hidden Cryptids Alliance! These guardians are preparing 
          to reveal their true nature as protectors rather than monsters.
        </p>
        
        <div className={`flex flex-wrap justify-center gap-6 ${
          upcomingCharacters.length >= 4 ? 'lg:grid lg:grid-cols-4' : 
          upcomingCharacters.length === 3 ? 'lg:grid lg:grid-cols-3' : 
          upcomingCharacters.length === 2 ? 'lg:grid lg:grid-cols-2' : ''
        } ${
          upcomingCharacters.length >= 2 ? 'md:grid md:grid-cols-2' : ''
        }`}>
          {upcomingCharacters.map((cryptid) => (
            <Card 
              key={cryptid.id}
              className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gray-800/90 border-purple-500/50 w-full max-w-sm"
              onClick={() => setSelectedCryptid(cryptid)}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  {cryptid.image_url ? (
                    <img 
                      src={cryptid.image_url} 
                      alt={cryptid.name}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-2 griffy-text">Coming Soon</div>
                        <div className="text-sm text-gray-300">{cryptid.name}</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <CardTitle className="text-lg griffy-text text-center mb-2 text-white">
                  {cryptid.name}
                </CardTitle>
                <p className="text-sm text-gray-300 text-center line-clamp-2 mb-3">
                  {cryptid.description}
                </p>
                <div className="text-center">
                  <Badge variant="outline" className="border-purple-400 text-purple-300">
                    Coming Soon ✨
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedCryptid && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCryptid(null)}
        >
          <div 
            className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 border-b border-purple-500/50 p-4 flex justify-between items-center">
              <h2 className="text-2xl griffy-text text-white">{selectedCryptid.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCryptid(null)}>
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                {selectedCryptid.image_url ? (
                  <img 
                    src={selectedCryptid.image_url} 
                    alt={selectedCryptid.name}
                    className="max-w-full h-auto rounded-lg mx-auto"
                  />
                ) : (
                  <div className="w-full max-w-md mx-auto h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2 griffy-text">Coming Soon</div>
                      <div className="text-lg text-gray-300">{selectedCryptid.name}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-xl font-semibold griffy-text mb-2 text-white">Bio</h3>
                  <p className="text-gray-300">{selectedCryptid.bio || selectedCryptid.description}</p>
                </div>
                
                {selectedCryptid.artist_notes && (
                  <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                    <h4 className="font-semibold text-purple-200 mb-2">Artist's Notes:</h4>
                    <p className="text-gray-300 italic">{selectedCryptid.artist_notes}</p>
                  </div>
                )}


                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-purple-500/30">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-purple-400 text-purple-300 hover:bg-purple-800/50"
                    onClick={() => window.open('https://www.youtube.com/@Hollowlogstudios', '_blank')}
                  >
                    <Youtube className="mr-2 h-4 w-4" />
                    Watch Videos
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-purple-400 text-purple-300 hover:bg-purple-800/50"
                    onClick={() => window.open('https://hollowlogstudios.printful.me/', '_blank')}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    HCA Merch
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UpcomingCryptids;