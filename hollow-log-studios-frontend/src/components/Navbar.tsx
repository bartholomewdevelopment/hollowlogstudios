import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SignupButton from '@/components/SignupButton';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-[#238830] text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/6825378e65c820488ff6350b_1754250861690_2151681d.png"
            alt="Hollow Log Studios Logo" 
            className="h-16 w-16"
          />
          <h1 className="text-xl font-bold font-griffy text-white">Hollow Log Studios</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-green-200 transition-colors">Home</Link>
          <Link to="/gallery" className="hover:text-green-200 transition-colors">Gallery/Shop</Link>
          <Link to="/commissions" className="hover:text-green-200 transition-colors">Commissions</Link>
          <Link to="/pebblewick" className="hover:text-green-200 transition-colors">Pebblewick</Link>
          <Link to="/cryptids" className="hover:text-green-200 transition-colors">Cryptids</Link>
          <Link to="/about" className="hover:text-green-200 transition-colors">About</Link>
          <Link to="/account" className="hover:text-green-200 transition-colors">Account</Link>
          <SignupButton />
        </div>
        
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-green-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 bg-green-800 rounded-md">
          <div className="flex flex-col space-y-3">
            <Link to="/" className="hover:text-green-200 transition-colors">Home</Link>
            <Link to="/gallery" className="hover:text-green-200 transition-colors">Gallery/Shop</Link>
            <Link to="/commissions" className="hover:text-green-200 transition-colors">Commissions</Link>
            <Link to="/pebblewick" className="hover:text-green-200 transition-colors">Pebblewick</Link>
            <Link to="/cryptids" className="hover:text-green-200 transition-colors">Cryptids</Link>
            <Link to="/about" className="hover:text-green-200 transition-colors">About</Link>
            <Link to="/account" className="hover:text-green-200 transition-colors">Account</Link>

            <div className="pt-2 border-t border-green-700">
              <SignupButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
