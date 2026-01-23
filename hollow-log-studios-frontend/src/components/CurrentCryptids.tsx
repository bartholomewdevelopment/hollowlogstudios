import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Youtube, ShoppingBag } from 'lucide-react';
import { Character } from '@/types';
import { getCharactersByType } from '@/firebase/characterService';

const CurrentCryptids: React.FC = () => {
  const navigate = useNavigate();
  const [currentCharacters, setCurrentCharacters] = useState<Character[]>([]);
  const [selectedCryptid, setSelectedCryptid] = useState<Character | null>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const allCharacters = await getCharactersByType('cryptid');
        setCurrentCharacters(allCharacters.filter(c => c.status === 'current'));
      } catch (error) {
        console.error('Error loading current cryptids:', error);
      }
    };
    loadCharacters();
  }, []);

  return (
    <>
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-purple-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text text-white">
            Core Alliance Members
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Meet the founding members of the Hidden Cryptids Alliance - brave guardians who have 
            stepped out of the shadows to protect both the natural world and humanity.
          </p>
          
          <div className={`grid gap-6 ${
            currentCharacters.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
            currentCharacters.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
            currentCharacters.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {currentCharacters.map((cryptid) => (
              <Card 
                key={cryptid.id}
                className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gray-800/90 border-purple-500/50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCryptid(cryptid);
                }}
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
                          <div className="text-2xl font-bold text-white mb-2 griffy-text">Current</div>
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
                    <Badge variant="outline" className="border-green-400 text-green-300">
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
                className="bg-gradient-to-r from-gray-700 to-purple-700 hover:from-gray-800 hover:to-purple-800 text-white px-8 py-3 text-lg font-semibold griffy-text"
                onClick={() => navigate('/cryptids')}
              >
                Enter the Hidden Cryptids Alliance
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Premium Dark Modal */}
      {selectedCryptid && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={() => setSelectedCryptid(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f12] via-[#0f1418] to-[#0a1210] border border-emerald-500/20 shadow-2xl shadow-emerald-900/20 animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

            <button
              onClick={() => setSelectedCryptid(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
            >
              <X className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <div className="flex flex-col lg:flex-row max-h-[90vh]">
              {selectedCryptid.image_url && (
                <div className="lg:w-1/2 bg-gradient-to-br from-emerald-950/50 via-transparent to-cyan-950/30 p-6 lg:p-8 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500" />
                    <img
                      src={selectedCryptid.image_url}
                      alt={selectedCryptid.name}
                      className="relative max-h-[50vh] lg:max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
                    />
                  </div>
                </div>
              )}

              <div className={`${selectedCryptid.image_url ? 'lg:w-1/2' : 'w-full'} overflow-y-auto`}>
                <div className="p-6 lg:p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-medium tracking-wide uppercase">Alliance Member</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold griffy-text text-white">
                      {selectedCryptid.name}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
                      Dossier
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {selectedCryptid.bio || selectedCryptid.description}
                    </p>
                  </div>

                  {selectedCryptid.artist_notes && (
                    <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/50 to-cyan-950/30 border border-emerald-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <h4 className="font-semibold text-emerald-300 text-sm uppercase tracking-wide">Field Notes</h4>
                        </div>
                        <p className="text-gray-300 italic leading-relaxed">"{selectedCryptid.artist_notes}"</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => window.open('https://www.youtube.com/@Hollowlogstudios', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-900/30 hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all duration-200"
                    >
                      <Youtube className="h-5 w-5" />
                      Watch Files
                    </button>
                    <button
                      onClick={() => window.open('https://hollowlogstudios.printful.me/', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:from-emerald-700 hover:to-cyan-800 transition-all duration-200"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      HCA Gear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

};

export default CurrentCryptids;