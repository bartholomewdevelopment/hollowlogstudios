import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import SignupButton from '@/components/SignupButton';
import { useCart } from '@/contexts/CartContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Shop' },
  { to: '/commissions', label: 'Commissions' },
  { to: '/pebblewick', label: 'Pebblewick' },
  { to: '/cryptids', label: 'Cryptids' },
  { to: '/about', label: 'About' },
  { to: '/account', label: 'Account' },
];

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-[#238830] focus:px-4 focus:py-2 focus:rounded focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      <nav
        className={`sticky top-0 z-40 bg-[#238830] text-white p-4 transition-shadow duration-200 ${
          scrolled ? 'shadow-lg' : 'shadow-md'
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Brand — span not h1 to avoid duplicate h1 per page */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/6825378e65c820488ff6350b_1754250861690_2151681d.png"
              alt="Hollow Log Studios Logo"
              className="h-16 w-16"
            />
            <span className="text-xl font-bold font-griffy text-white group-hover:text-green-200 transition-colors">
              Hollow Log Studios
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`transition-colors font-medium ${
                  isActive(to)
                    ? 'text-white underline underline-offset-4 decoration-green-300'
                    : 'text-green-100 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Cart button with badge */}
            <button
              onClick={toggleCart}
              className="relative cursor-pointer text-green-100 hover:text-white transition-colors"
              aria-label={`Open cart${totalItems > 0 ? `, ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#238830] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            <SignupButton />
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleCart}
              className="relative cursor-pointer text-green-100 hover:text-white transition-colors"
              aria-label={`Open cart${totalItems > 0 ? `, ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#238830] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            <Button
              variant="ghost"
              className="text-white hover:bg-green-700"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 bg-green-800 rounded-md">
            <div className="flex flex-col space-y-3">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`transition-colors font-medium ${
                    isActive(to)
                      ? 'text-white underline underline-offset-4 decoration-green-300'
                      : 'text-green-200 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-green-700">
                <SignupButton />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
