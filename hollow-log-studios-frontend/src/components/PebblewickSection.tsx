import React from 'react';
import CurrentCharacters from './CurrentCharacters';
import UpcomingCharacters from './UpcomingCharacters';
import StoryVideos from './StoryVideos';

const PebblewickSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50">
      <CurrentCharacters />
      <UpcomingCharacters />
      <StoryVideos />
    </div>
  );
};

export default PebblewickSection;