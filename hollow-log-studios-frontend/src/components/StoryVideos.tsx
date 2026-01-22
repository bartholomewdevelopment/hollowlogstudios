import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Volume2, Clock, Play } from 'lucide-react';
import { Character } from '@/types';
import { getCharactersByType } from '@/firebase/characterService';

const StoryVideos: React.FC = () => {
  const [storyVideos, setStoryVideos] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoryVideos = async () => {
      try {
        const characters = await getCharactersByType('pebblewick');
        const videosOnly = characters.filter(char => char.has_video_story && char.youtube_url);
        setStoryVideos(videosOnly);
      } catch (error) {
        console.error('Error loading story videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoryVideos();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-gray-600">Loading story videos...</div>
        </div>
      </section>
    );
  }

  if (storyVideos.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text floating-sparkles">
          Story & Painting Videos
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Join us in the magical art studio where stories come alive through paint and imagination. 
          Each video is like opening an enchanted storybook!
        </p>
        
        <div className={`flex flex-wrap justify-center gap-8 ${
          storyVideos.length === 1 ? 'max-w-md mx-auto' :
          storyVideos.length === 2 ? 'max-w-2xl mx-auto' :
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {storyVideos.map((character) => (
            <Card 
              key={character.id}
              className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl sparkle-effect glitter-border floating-sparkles cursor-pointer"
              onClick={() => character.youtube_url && window.open(character.youtube_url, '_blank')}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={character.image_url || '/placeholder.svg'} 
                    alt={character.name}
                    className="w-full h-56 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <div className="bg-white/90 rounded-full p-4 transform scale-75 hover:scale-100 transition-transform duration-300">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>
                  
                  {/* Storybook Frame Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-transparent to-amber-100/20"></div>
                  <div className="absolute inset-2 border-2 border-amber-200/50 rounded-lg"></div>
                  
                  {/* Story Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-purple-100 text-purple-800 sparkle-effect">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Story Video
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl griffy-text text-center mb-3">
                  {character.name}'s Story
                </CardTitle>
                <p className="text-gray-600 text-center leading-relaxed mb-4">
                  {character.description || character.bio}
                </p>
                <div className="flex justify-center">
                  <Badge variant="outline" className="sparkle-effect">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Watch Story
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoryVideos;