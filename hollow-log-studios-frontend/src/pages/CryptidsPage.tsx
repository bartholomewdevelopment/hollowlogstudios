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
    <div className="min-h-screen bg-gradient-to-b from-[#070b0f] via-[#0d1518] to-[#050607] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20">
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,59,38,0.3),transparent_70%)] blur-3xl" />
        <div className="absolute right-[-10%] top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%)]" />

        <div className="relative mx-auto max-w-6xl grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
              Alliance Dossier
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold griffy-text">
              The Hidden Cryptids Alliance
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
              Misunderstood guardians who work across time and dimensions to protect humanity.
              Led by Mothman the scholar and Bigfoot the trapper, the HCA guards what we cannot see.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold"
                onClick={() => document.getElementById('core-alliance')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Meet the Alliance
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={() => window.open('https://www.youtube.com/@Hollowlogstudios', '_blank')}
              >
                Watch Field Reports
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Alliance Oaths</p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li>Protect the curious. Guard the hidden. Preserve the wonder.</li>
                <li>Act across worlds without taking from them.</li>
                <li>Leave every realm wilder than you found it.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Field Notes</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/80">
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="text-lg font-semibold text-emerald-300">12</div>
                  Known guardians
                </div>
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="text-lg font-semibold text-emerald-300">4</div>
                  Realms protected
                </div>
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="text-lg font-semibold text-emerald-300">1</div>
                  Alliance mission
                </div>
                <div className="rounded-xl bg-black/30 p-3">
                  <div className="text-lg font-semibold text-emerald-300">∞</div>
                  Stories untold
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Characters Section */}
      <section id="core-alliance" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Core Alliance</p>
            <h2 className="text-4xl md:text-5xl font-bold griffy-text text-white mt-3">
              Core Alliance Members
            </h2>
          </div>
          {loading ? (
            <div className="text-center text-white/70">Loading characters...</div>
          ) : (
            <div className={`flex flex-wrap justify-center gap-8 ${
              currentCharacters.length >= 2 ? 'md:grid md:grid-cols-2' : ''
            }`}>
              {currentCharacters.map((character) => (
                <Card
                  key={character.id}
                  className="cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-white/5 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur w-full max-w-sm"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <Badge className="absolute top-3 left-3 bg-emerald-500/90 text-black">
                        Core Member
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-2xl griffy-text text-center mb-2 text-white">
                      {character.name}
                    </CardTitle>
                    <p className="text-white/70 text-center leading-relaxed">
                      {character.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
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
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f12] via-[#0f1418] to-[#0a1210] border border-emerald-500/20 shadow-2xl shadow-emerald-900/20 animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

            {/* Close Button */}
            <button
              onClick={() => setSelectedCryptid(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
            >
              <X className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <div className="flex flex-col lg:flex-row max-h-[90vh]">
              {/* Image Section */}
              {selectedCryptid.image_url && (
                <div className="lg:w-1/2 bg-gradient-to-br from-emerald-950/50 via-transparent to-cyan-950/30 p-6 lg:p-8 flex items-center justify-center relative">
                  {/* Ambient glow */}
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

              {/* Content Section */}
              <div className={`${selectedCryptid.image_url ? 'lg:w-1/2' : 'w-full'} overflow-y-auto`}>
                <div className="p-6 lg:p-8 space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-medium tracking-wide uppercase">Alliance Member</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold griffy-text text-white">
                      {selectedCryptid.name}
                    </h2>
                  </div>

                  {/* Bio */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" />
                      Dossier
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {selectedCryptid.bio || selectedCryptid.description}
                    </p>
                  </div>

                  {/* Artist Notes */}
                  {selectedCryptid.artist_notes && (
                    <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/50 to-cyan-950/30 border border-emerald-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <h4 className="font-semibold text-emerald-300 text-sm uppercase tracking-wide">
                            Field Notes
                          </h4>
                        </div>
                        <p className="text-gray-300 italic leading-relaxed">
                          "{selectedCryptid.artist_notes}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => window.open('https://www.youtube.com/@Hollowlogstudios', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40 hover:from-red-700 hover:to-red-800 transition-all duration-200"
                    >
                      <Youtube className="h-5 w-5" />
                      Watch Files
                    </button>
                    <button
                      onClick={() => window.open('https://hollowlogstudios.printful.me/', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-900/40 hover:from-emerald-700 hover:to-cyan-800 transition-all duration-200"
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

      {/* Upcoming Characters Section */}
      <UpcomingCryptids />

      {/* Story Videos Section */}
      <CryptidStoryVideos />


      
      <Footer />
    </div>
  );
};

export default CryptidsPage;
