import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Book, Character, Mural, Painting } from '@/types';
import { Eye, ShoppingCart, Brush, BookOpen } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import ArtShowcase, { ShowcaseItem } from '@/components/ArtShowcase';
import { getShowcaseSelection } from '@/firebase/showcaseService';
import { autographedPrice, canAutograph } from '@/lib/bookPricing';
import PreOrderBadge from '@/components/PreOrderBadge';
import { useNavigate } from 'react-router-dom';
import { fetchPaintings } from '@/firebase/galleryService';
import { fetchBooks } from '@/firebase/bookService';
import { getAllCharacters } from '@/firebase/characterService';
import { getMurals } from '@/firebase/muralService';
import { displayImage, thumbImage } from '@/lib/webImage';
import ProductDetailModal from '@/components/ProductDetailModal';
import MuralDetailModal from '@/components/MuralDetailModal';
import { CharacterModal } from '@/components/CharacterModal';

// ─── Each carousel item carries its destination route ────────────────────────
const MAX_SHOWCASE_ITEMS = 12;

/** Full records behind the showcase items, so a piece can open in its dialog. */
interface ArtDocs {
  painting: Record<string, Painting>;
  mural: Record<string, Mural>;
  character: Record<string, Character>;
}

async function fetchAllArtImages(): Promise<{ items: ShowcaseItem[]; docs: ArtDocs }> {
  const [paintings, books, characters, murals] = await Promise.allSettled([
    fetchPaintings(),
    fetchBooks(),
    getAllCharacters(),
    getMurals(),
  ]);

  // Deterministic order: published books, then original characters, then
  // paintings, then murals. Randomising meant the site looked different on
  // every visit, which is the opposite of what a portfolio wants.
  const items: (ShowcaseItem & { tagged: boolean })[] = [];

  if (books.status === 'fulfilled') {
    books.value.forEach(b => {
      if (b.image_url)
        items.push({ url: displayImage(b), thumb: thumbImage(b), href: `/book/${b.id}`, label: b.title, kind: 'Book', source_type: 'book', source_id: b.id, tagged: !!b.showcase });
    });
  }
  if (characters.status === 'fulfilled') {
    characters.value.forEach(c => {
      if (c.image_url) {
        const href = c.character_type === 'cryptid' ? '/cryptids' : '/pebblewick';
        items.push({ url: displayImage(c), thumb: thumbImage(c), href, label: c.name, kind: 'Character', source_type: 'character', source_id: c.id, tagged: !!c.showcase });
      }
    });
  }
  if (paintings.status === 'fulfilled') {
    paintings.value.forEach(p => {
      if (p.image_url)
        items.push({ url: displayImage(p), thumb: thumbImage(p), href: '/gallery', label: p.title, kind: 'Painting', source_type: 'painting', source_id: p.id, tagged: !!p.showcase });
    });
  }
  // Murals were left out before tagging existed — they are not what she
  // pitches to literary agents. Now they only appear when tagged or chosen.
  if (murals.status === 'fulfilled') {
    murals.value.forEach(m => {
      if (m.image_url)
        items.push({ url: displayImage(m), thumb: thumbImage(m), href: '/gallery', label: m.title, kind: 'Mural', source_type: 'mural', source_id: m.id, tagged: !!m.showcase });
    });
  }

  const byId = <T extends { id: string }>(result: PromiseSettledResult<T[]>) =>
    Object.fromEntries(
      (result.status === 'fulfilled' ? result.value : []).map(d => [d.id, d])
    ) as Record<string, T>;
  const docs: ArtDocs = { painting: byId(paintings), mural: byId(murals), character: byId(characters) };

  // A curated selection wins; its order is the order shown. Anything that has
  // since been deleted simply drops out.
  const selection = await getShowcaseSelection();
  if (selection) {
    const byKey = new Map(items.map(i => [`${i.source_type}:${i.source_id}`, i]));
    const curated = selection
      .map(ref => byKey.get(`${ref.source_type}:${ref.source_id}`))
      .filter((i): i is (typeof items)[number] => Boolean(i));
    if (curated.length > 0) return { items: curated, docs };
  }

  // Otherwise pick automatically — a showcase, not an archive. Tagged work
  // first; until anything is tagged, fall back to the old choice (no murals).
  const tagged = items.filter(i => i.tagged);
  const pool = tagged.length > 0 ? tagged : items.filter(i => i.source_type !== 'mural');
  return { items: pool.slice(0, MAX_SHOWCASE_ITEMS), docs };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
interface HeroProps {
  featuredBook?: Book | null;
  onViewBookDetails?: () => void;
}

const Hero: React.FC<HeroProps> = ({ featuredBook, onViewBookDetails }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [artItems, setArtItems] = useState<ShowcaseItem[]>([]);
  const [artDocs, setArtDocs] = useState<ArtDocs>({ painting: {}, mural: {}, character: {} });
  // The piece opened from the showcase, kept briefly after closing so the
  // dialog can animate out
  const [viewing, setViewing] = useState<ShowcaseItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchAllArtImages()
      .then(({ items, docs }) => {
        setArtItems(items);
        setArtDocs(docs);
      })
      .catch(err => console.error('Failed to load art images:', err));
  }, []);

  // Paintings, murals and characters open in place; books have their own page.
  const handleViewArt = (item: ShowcaseItem) => {
    const type = item.source_type as keyof ArtDocs | 'book' | undefined;
    if (type && type !== 'book' && item.source_id && artDocs[type][item.source_id]) {
      setViewing(item);
      setViewOpen(true);
    } else {
      navigate(item.href);
    }
  };

  const closeViewing = () => {
    setViewOpen(false);
    setTimeout(() => setViewing(null), 300);
  };

  const viewedId = viewing?.source_id ?? '';
  const viewedPainting = viewing?.source_type === 'painting' ? artDocs.painting[viewedId] ?? null : null;
  const viewedMural = viewing?.source_type === 'mural' ? artDocs.mural[viewedId] ?? null : null;
  const viewedCharacter = viewing?.source_type === 'character' ? artDocs.character[viewedId] ?? null : null;

  const handleAddToCart = () => {
    if (!featuredBook || featuredBook.price === null) return;

    const signed = canAutograph(featuredBook);
    addToCart({
      id: signed ? `${featuredBook.id}-autographed` : featuredBook.id,
      title: signed ? `${featuredBook.title} (Autographed)` : featuredBook.title,
      price: signed ? autographedPrice(featuredBook.price) : featuredBook.price,
      image_url: featuredBook.image_url,
      type: 'book',
      pre_order: featuredBook.pre_order,
    });
  };

  return (
    <>
    <section
      id="main-content"
      className="fairy-lattice-light relative bg-gradient-to-br from-green-900 via-[#238830] to-green-700 overflow-hidden"
    >

      <div className="container mx-auto px-4 relative py-12 md:py-16">

        {/* ── Row 1: Left (copy) + Right (featured book) ── */}
        <div className="flex flex-col lg:flex-row items-start gap-12">

          {/* Left: copy + CTAs */}
          <div className="lg:w-1/2 text-white lg:pt-4">
            <p className="text-green-200 font-semibold tracking-[0.25em] text-xs uppercase mb-3">
              Children&rsquo;s Book Illustrator &middot; Watercolor
            </p>
            <h1 className="text-5xl md:text-6xl font-bold font-griffy text-white mb-4 leading-tight">
              Bethany Bartholomew
            </h1>
            <p className="text-lg text-green-100 mb-6 max-w-lg leading-relaxed">
              Watercolor stories rooted in folklore and rural life &mdash; gentle
              characters, natural texture, and diverse young heroes who see
              themselves in the pages.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#238830] hover:bg-green-50 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/gallery')}
              >
                <Eye className="h-5 w-5 mr-2" />
                View the Portfolio
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#238830] font-semibold px-8 py-3 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Picture Books
              </Button>
              <button
                type="button"
                onClick={() => navigate('/commissions')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-green-100 underline-offset-4 hover:text-white hover:underline cursor-pointer"
              >
                <Brush className="h-4 w-4" />
                Commission work
              </button>
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
                    {featuredBook.pre_order && <PreOrderBadge className="mb-2" />}
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

      </div>
    </section>

    {/* ── Selected work — its own quiet white section, so the artwork is
        framed by space instead of competing with the green ── */}
    {artItems.length > 0 && (
      <section className="relative border-b border-stone-200/70 bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <ArtShowcase items={artItems} onView={handleViewArt} />
        </div>
      </section>
    )}

    <ProductDetailModal isOpen={viewOpen && !!viewedPainting} onClose={closeViewing} painting={viewedPainting} />
    <MuralDetailModal isOpen={viewOpen && !!viewedMural} onClose={closeViewing} mural={viewedMural} />
    {viewedCharacter && (
      <CharacterModal character={viewedCharacter} isOpen={viewOpen} onClose={closeViewing} />
    )}
    </>
  );
};

export default Hero;
