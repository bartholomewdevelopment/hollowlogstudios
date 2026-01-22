import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Play } from 'lucide-react';
import { Character } from '@/types';
import { getCharactersByType } from '@/firebase/characterService';

const CryptidStoryVideos: React.FC = () => {
  const [storyVideos, setStoryVideos] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoryVideos = async () => {
      try {
        const characters = await getCharactersByType('cryptid');
        const videosOnly = characters.filter(char => char.has_video_story && char.youtube_url);
        setStoryVideos(videosOnly);
      } catch (error) {
        console.error('Error loading cryptid story videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoryVideos();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900/30 to-gray-900/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-white">Loading story videos...</div>
        </div>
      </section>
    );
  }

  if (storyVideos.length === 0) {
    return null; // Don't show section if no videos
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-purple-900/30 to-gray-900/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 griffy-text text-white">
          HCA Story & Adventure Videos
        </h2>
        <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
          Dive into the adventures of the Hidden Cryptids Alliance as they work across dimensions 
          to protect humanity from disasters both seen and unseen.
        </p>
        
        <div className={`flex flex-wrap justify-center gap-8 ${
          storyVideos.length === 1 ? 'max-w-md mx-auto' :
          storyVideos.length === 2 ? 'max-w-2xl mx-auto' :
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {storyVideos.map((character) => (
            <div 
              key={character.id}
              className="group relative bg-gray-800/90 rounded-lg overflow-hidden shadow-lg border border-purple-500/50 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => character.youtube_url && window.open(character.youtube_url, '_blank')}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={character.image_url || '/placeholder.svg'}
                  alt={character.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-red-600 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    variant="secondary"
                    className="bg-purple-600/80 text-white hover:bg-purple-700/80"
                  >
                    Story Video
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold mb-2 griffy-text text-white">
                  {character.name}'s Adventure
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {character.description || character.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CryptidStoryVideos;