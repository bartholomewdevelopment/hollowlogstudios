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

      {selectedArt && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArt(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl griffy-text">{selectedArt.title}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedArt(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                <img 
                  src={selectedArt.image} 
                  alt={selectedArt.title}
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-xl font-semibold griffy-text mb-2">Bio</h3>
                  <p className="text-gray-700">{selectedArt.description}</p>
                </div>
                
                {selectedArt.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Artist's Notes:</h4>
                    <p className="text-gray-700 italic">{selectedArt.notes}</p>
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
    </section>
  );
};

export default UpcomingCharacters;