import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Youtube, ShoppingBag } from 'lucide-react';
import { Character } from '@/types';
import { getCharactersByType } from '@/firebase/characterService';

const CurrentCharacters: React.FC = () => {
  const navigate = useNavigate();
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const allCharacters = await getCharactersByType('pebblewick');
        setCurrentCharacters(allCharacters.filter(c => c.status === 'current'));
      } catch (error) {
        console.error('Error loading current characters:', error);
      }
    };
    loadCharacters();
  }, []);

  return (
    <>
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text">
            Current Characters
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Meet the beloved residents of Pebblewick-by-the-Sea who are currently featured 
            in our magical stories and adventures.
          </p>
          
          <div className={`grid gap-6 ${
            currentCharacters.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
            currentCharacters.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
            currentCharacters.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {currentCharacters.map((character) => (
              <Card 
                key={character.id}
                className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCharacter(character);
                }}
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {character.image_url ? (
                      <img 
                        src={character.image_url} 
                        alt={character.name}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600 mb-2 griffy-text">Current</div>
                          <div className="text-sm text-gray-500">{character.name}</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <CardTitle className="text-lg griffy-text text-center mb-2">
                    {character.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 text-center line-clamp-2 mb-3">
                    {character.description}
                  </p>
                  <div className="text-center">
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      Current ⭐
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {currentCharacters.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold griffy-text"
                onClick={() => navigate('/pebblewick')}
              >
                Enter the World of Pebblewick
              </Button>
            </div>
          )}
        </div>
      </section>

      {selectedCharacter && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCharacter(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl griffy-text">{selectedCharacter.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCharacter(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                {selectedCharacter.image_url ? (
                  <img 
                    src={selectedCharacter.image_url} 
                    alt={selectedCharacter.name}
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-600 mb-2 griffy-text">Current</div>
                      <div className="text-lg text-gray-500">{selectedCharacter.name}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-xl font-semibold griffy-text mb-2">Bio</h3>
                  <p className="text-gray-700">{selectedCharacter.bio || selectedCharacter.description}</p>
                </div>
                
                {selectedCharacter.artist_notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Artist's Notes:</h4>
                    <p className="text-gray-700 italic">{selectedCharacter.artist_notes}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentCharacters;