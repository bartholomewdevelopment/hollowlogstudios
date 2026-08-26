import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Book } from '@/types';
import { Eye, ShoppingCart, Brush } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { fetchPaintings } from '@/firebase/galleryService';
import { fetchBooks } from '@/firebase/bookService';
import { getMurals } from '@/firebase/muralService';
import { getAllCharacters } from '@/firebase/characterService';

// ─── Each carousel item carries its destination route ────────────────────────
interface CarouselItem {
  url: string;
  href: string;   // route to navigate to on click
  label: string;  // accessible description
}

async function fetchAllArtImages(): Promise<CarouselItem[]> {
  const [paintings, books, murals, characters] = await Promise.allSettled([
    fetchPaintings(),
    fetchBooks(),
    getMurals(),
    getAllCharacters(),
  ]);

  const items: CarouselItem[] = [];

  if (paintings.status === 'fulfilled') {
    paintings.value.forEach(p => {
      if (p.image_url) items.push({ url: p.image_url, href: '/gallery', label: p.title });
    });
  }
  if (books.status === 'fulfilled') {
    books.value.forEach(b => {
      if (b.image_url) items.push({ url: b.image_url, href: `/book/${b.id}`, label: b.title });
    });
  }
  if (murals.status === 'fulfilled') {
    murals.value.forEach(m => {
      if (m.image_url) items.push({ url: m.image_url, href: '/gallery', label: m.title ?? 'Mural' });
    });
  }
  if (characters.status === 'fulfilled') {
    characters.value.forEach(c => {
      if (c.image_url) {
        const href = c.character_type === 'cryptid' ? '/cryptids' : '/pebblewick';
        items.push({ url: c.image_url, href, label: c.name });
      }
    });
  }

  return items.sort(() => Math.random() - 0.5);
}

// ─── Infinite crossfade carousel ─────────────────────────────────────────────
const INTERVAL_MS = 4000;
const FADE_MS = 600;

const ArtCarousel: React.FC<{ items: CarouselItem[] }> = ({ items }) => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length < 2) return;

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % items.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, items.length]);

  if (items.length === 0) return null;

  const item = items[current];

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => navigate(item.href)}
        className="relative flex items-center justify-center w-full cursor-pointer group focus:outline-none"
        style={{ minHeight: '220px' }}
        aria-label={`View ${item.label}`}
      >
        <img
          key={current}
          src={item.url}
          alt={item.label}
          className="max-w-full rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
          style={{
            maxHeight: '320px',
            objectFit: 'contain',
            opacity: visible ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
          loading="lazy"
        />
        {/* Subtle hover overlay with "View" label */}
        <div
          className="absolute inset-0 rounded-xl flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }}
        >
          <span className="text-white text-sm font-semibold tracking-wide drop-shadow">
            View {item.label}
          </span>
        </div>
      </button>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <span
              key={i}
              className="inline-block rounded-full transition-all duration-300"
              style={{
                width: i === current ? '16px' : '6px',
                height: '6px',
                background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
interface HeroProps {
  featuredBook?: Book | null;
  onViewBookDetails?: () => void;
}

const Hero: React.FC<HeroProps> = ({ featuredBook, onViewBookDetails }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const autographedPrice = 37.99;
  const [artItems, setArtItems] = useState<CarouselItem[]>([]);

  useEffect(() => {
    fetchAllArtImages()
      .then(setArtItems)
      .catch(err => console.error('Failed to load art images:', err));
  }, []);

  const handleAddToCart = () => {
    if (featuredBook) {
      addToCart({
        id: `${featuredBook.id}-autographed`,
        title: `${featuredBook.title} (Autographed)`,
        price: autographedPrice,
        image_url: featuredBook.image_url,
        type: 'book',
      });
    }
  };

  return (
    <section
      id="main-content"
      className="relative bg-gradient-to-br from-green-900 via-[#238830] to-green-700 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative py-12 md:py-16">

        {/* ── Row 1: Left (copy) + Right (featured book) ── */}
        <div className="flex flex-col lg:flex-row items-start gap-12">

          {/* Left: copy + CTAs */}
          <div className="lg:w-1/2 text-white lg:pt-4">
            <p className="text-green-200 font-semibold tracking-widest text-sm uppercase mb-3">
              Bethany Bartholomew &mdash; Hollow Log Studios
            </p>
            <h1 className="text-5xl md:text-6xl font-bold font-griffy text-white mb-5 leading-tight">
              Watercolor Fairy Tale Art
            </h1>
            <p className="text-lg text-green-100 mb-8 max-w-lg leading-relaxed">
              Bringing diverse cultures and magical worlds to life through exquisite
              watercolor paintings, custom illustrations, and breathtaking murals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-[#238830] hover:bg-green-50 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/gallery')}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#238830] font-semibold px-8 py-3 transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/commissions')}
              >
                <Brush className="h-5 w-5 mr-2" />
                Commission Art
              </Button>
            </div>
          </div>

          {/* Right: Featured Book */}
          <div className="lg:w-1/2 w-full">
            {featuredBook ? (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-green-50 px-6 pt-5 pb-2">
                  <span className="inline-block bg-[#238830] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                    Featured Book
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-2/5 bg-green-50 flex items-center justify-center p-6">
                    <img
                      src={featuredBook.image_url}
                      alt={featuredBook.title}
                      className="w-full max-w-[160px] h-auto rounded-lg shadow-md object-contain"
                      loading="eager"
                    />
                  </div>
                  <div className="sm:w-3/5 p-6">
                    <h2 className="text-xl font-bold font-griffy text-green-800 mb-2">
                      {featuredBook.title}
                    </h2>
                    {featuredBook.description && (
                      <p className="text-gray-500 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {featuredBook.description}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#238830] text-[#238830] hover:bg-green-50 flex items-center gap-1 cursor-pointer"
                        onClick={onViewBookDetails}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#238830] hover:bg-green-700 text-white flex items-center gap-1 cursor-pointer"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 border-2 border-white/20 rounded-2xl p-10 text-center text-white/80">
                <Brush className="h-16 w-16 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-griffy">Original watercolors &amp; prints</p>
                <p className="text-sm mt-1 text-green-200">Ships worldwide</p>
              </div>
            )}
          </div>

        </div>

        {/* ── Row 2: Full-width carousel ── */}
        {artItems.length > 0 && (
          <div className="mt-8">
            <ArtCarousel items={artItems} />
          </div>
        )}

      </div>
    </section>
  );
};

export default Hero;
