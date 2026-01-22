import React from 'react';
import CurrentCryptids from './CurrentCryptids';
import UpcomingCryptids from './UpcomingCryptids';
import CryptidStoryVideos from './CryptidStoryVideos';

const CryptidsSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <CurrentCryptids />
      <UpcomingCryptids />
      <CryptidStoryVideos />
    </div>
  );
};

export default CryptidsSection;