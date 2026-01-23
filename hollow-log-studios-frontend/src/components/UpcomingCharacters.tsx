import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Youtube, ShoppingBag } from 'lucide-react';

interface UpcomingArt {
  id: number;
  title: string;
  type: 'sketch' | 'watercolor' | 'video';
  image: string;
  description: string;
  notes?: string;
}

const upcomingArt: UpcomingArt[] = [
  {
    id: 1,
    title: "Tybalt Tiberius Terwin",
    type: "sketch",
    image: "https://d64gsuwffb70l.cloudfront.net/6825378e65c820488ff6350b_1755794070025_fcef0fb5.jpg",
    description: "A toad who wants to shed his shyness to be able to recite his poetry in public.",
    notes: "Working on capturing his nervous but hopeful expression as he practices his verses by the lily pads."
  },
  {
    id: 2,
    title: "Floribunda Fallwater",
    type: "watercolor",
    image: "https://d64gsuwffb70l.cloudfront.net/6825378e65c820488ff6350b_1755794473331_b28ab698.jpg",
    description: "A young fox who likes to bake magical treats for all the creatures of Pebblewick.",
    notes: "Experimenting with warm autumn colors for her cozy bakery apron and flour-dusted paws."
  }
];

const UpcomingCharacters: React.FC = () => {
  const [selectedArt, setSelectedArt] = useState<UpcomingArt | null>(null);

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text">
          Upcoming Characters & Art
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Peek behind the curtain at works in progress! These characters are still taking shape 
          in the magical realm of Pebblewick-by-the-Sea.
        </p>
        
        <div className={`flex flex-wrap justify-center gap-6 ${
          upcomingArt.length >= 4 ? 'lg:grid lg:grid-cols-4' : 
          upcomingArt.length === 3 ? 'lg:grid lg:grid-cols-3' : 
          upcomingArt.length === 2 ? 'lg:grid lg:grid-cols-2' : ''
        } ${
          upcomingArt.length >= 2 ? 'md:grid md:grid-cols-2' : ''
        }`}>
          {upcomingArt.map((art) => (
            <Card 
              key={art.id}
              className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl w-full max-w-sm"
              onClick={() => setSelectedArt(art)}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={art.image} 
                    alt={art.title}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg griffy-text text-center mb-2">
                  {art.title}
                </CardTitle>
                <p className="text-sm text-gray-600 text-center line-clamp-2">
                  {art.description}
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

      {/* Premium Whimsical Modal */}
      {selectedArt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={() => setSelectedArt(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-pink-900/60 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/50 to-pink-50/50 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

            <button
              onClick={() => setSelectedArt(null)}
              className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <X className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
            </button>

            <div className="flex flex-col lg:flex-row max-h-[90vh]">
              <div className="lg:w-1/2 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6 lg:p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-blue-200/40 blur-xl" />
                <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-pink-200/40 blur-xl" />
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                  <img
                    src={selectedArt.image}
                    alt={selectedArt.title}
                    className="relative max-h-[50vh] lg:max-h-[70vh] w-auto object-contain rounded-xl shadow-xl"
                  />
                </div>
              </div>

              <div className="lg:w-1/2 overflow-y-auto">
                <div className="p-6 lg:p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-500">
                      <span className="text-lg">🎨</span>
                      <span className="text-sm font-medium tracking-wide uppercase">Coming Soon</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold griffy-text bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {selectedArt.title}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                      Their Story
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedArt.description}
                    </p>
                  </div>

                  {selectedArt.notes && (
                    <div className="p-5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/30 rounded-full blur-xl" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <h4 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">From the Artist</h4>
                        </div>
                        <p className="text-amber-900/80 italic leading-relaxed">"{selectedArt.notes}"</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => window.open('https://www.youtube.com/@Hollowlogstudios', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200"
                    >
                      <Youtube className="h-5 w-5" />
                      Watch Stories
                    </button>
                    <button
                      onClick={() => window.open('https://hollowlogstudios.printful.me/', '_blank')}
                      className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
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
      )}
    </section>
  );
};

export default UpcomingCharacters;