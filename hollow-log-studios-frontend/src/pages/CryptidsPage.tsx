import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Youtube, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpcomingCryptids from '@/components/UpcomingCryptids';
import CryptidStoryVideos from '@/components/CryptidStoryVideos';

import { Character } from '@/types';
import { getCharactersByType } from '@/firebase/characterService';
const CryptidsPage: React.FC = () => {
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([]);
  const [selectedCryptid, setSelectedCryptid] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const allCharacters = await getCharactersByType('cryptid');
        setCurrentCharacters(allCharacters.filter(c => c.status === 'current'));
      } catch (error) {
        console.error('Error loading cryptid characters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 griffy-text text-white">
            <div>The Hidden Cryptids</div>
            <div>Alliance</div>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
            Meet the misunderstood guardians who work across time and dimensions to protect humanity. 
            Led by Mothman the scholar and Bigfoot the trapper, they are the HCA.
          </p>
        </div>
      </section>

      {/* Current Characters Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 griffy-text text-white">
            Core Alliance Members
          </h2>
          {loading ? (
            <div className="text-center text-white">Loading characters...</div>
          ) : (
          <div className={`flex flex-wrap justify-center gap-8 ${
            currentCharacters.length >= 2 ? 'md:grid md:grid-cols-2' : ''
          }`}>
            {currentCharacters.map((character) => (
              <Card 
                key={character.id} 
                className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gray-900/95 border-red-900/50 shadow-lg shadow-red-900/20 hover:shadow-red-900/40 w-full max-w-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCryptid(character);
                }}
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={character.image_url || '/placeholder.svg'} 
                      alt={character.name}
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl griffy-text text-center mb-2 text-white">
                    {character.name}
                  </CardTitle>
                  <p className="text-gray-300 text-center leading-relaxed">
                    {character.description}
                  </p>
                  <div className="text-center mt-4">
                    <Badge variant="outline" className="border-green-400 text-green-300">
                      Current ⭐
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Modal */}
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
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full max-w-md mx-auto h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2 griffy-text">Current</div>
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

      {/* Upcoming Characters Section */}
      <UpcomingCryptids />

      {/* Story Videos Section */}
      <CryptidStoryVideos />


      
      <Footer />
    </div>
  );
};

export default CryptidsPage;