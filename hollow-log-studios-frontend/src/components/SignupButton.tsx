import React from 'react';
import { Button } from '@/components/ui/button';
import SignupModal from './SignupModal';

const SignupButton: React.FC = () => {
  return (
    <SignupModal>
      <Button 
        className="
          font-bold py-2 px-4 rounded-full 
          transition-all duration-300 transform hover:scale-105 
          shadow-lg hover:shadow-xl
          bg-gradient-to-r from-purple-600 to-pink-600 
          hover:from-purple-700 hover:to-pink-700
          text-white border-2 border-white/20
          hover:border-white/40
        "
      >
        Newsletter Signup
      </Button>
    </SignupModal>
  );
};

export default SignupButton;