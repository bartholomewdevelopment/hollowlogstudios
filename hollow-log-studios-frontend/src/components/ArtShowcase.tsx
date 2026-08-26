import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export interface ShowcaseItem {
  url: string;
  href: string;
  label: string;
  /** "Painting", "Book", "Mural", "Character" — shown under the title. */
  kind: string;
}

const INTERVAL_MS = 6000;

/** Auto-advance is a nicety, not the way to see the work: the filmstrip and
 *  arrows are always available, and anyone who prefers less motion gets a
 *  still image they drive themselves. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

const ArtShowcase: React.FC<{ items: ShowcaseItem[] }> = ({ items }) => {
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stripRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => setCurrent((next + items.length) % items.length),
    [items.length]
  );

  // Auto-advance, paused on hover/focus, when reduced motion is requested,
  // or when the tab is in the background.
  useEffect(() => {
    if (!playing || reducedMotion || items.length < 2) return;
    const id = setTimeout(() => go(current + 1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [current, playing, reducedMotion, items.length, go]);

  // Keep the active thumbnail in view as the slide changes.
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.children[current] as HTMLElement | undefined;
    if (strip && active) {
      const left = active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2;
      strip.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }, [current, reducedMotion]);

  if (items.length === 0) return null;
  const item = items[current];

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      onFocusCapture={() => setPlaying(false)}
      onBlurCapture={() => setPlaying(true)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected work"
    >
      {/* Stage — fixed height so nothing jumps as slides change */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-sm">
        <div className="relative h-64 w-full sm:h-80 lg:h-[420px]">
          {items.map((it, i) => (
            <img
              key={it.url}
              src={it.url}
              alt={i === current ? it.label : ''}
              aria-hidden={i !== current}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-700 ease-in-out sm:p-6 ${
                i === current ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(current - 1)}
                aria-label="Previous work"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(current + 1)}
                aria-label="Next work"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Caption — always visible, not hover-only */}
        <div className="flex items-end justify-between gap-4 border-t border-white/15 bg-black/25 px-5 py-3 backdrop-blur">
          <div className="min-w-0" aria-live="polite">
            <p className="truncate font-griffy text-lg leading-tight text-white">{item.label}</p>
            <p className="text-xs uppercase tracking-widest text-green-200">{item.kind}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {items.length > 1 && !reducedMotion && (
              <button
                type="button"
                onClick={() => setPlaying(p => !p)}
                aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(item.href)}
              className="whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#238830] transition hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              View
            </button>
          </div>
        </div>
      </div>

      {/* Filmstrip — replaces a row of meaningless dots */}
      {items.length > 1 && (
        <div
          ref={stripRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it, i) => (
            <button
              key={it.url}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${it.label}`}
              aria-current={i === current}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                i === current
                  ? 'border-white opacity-100'
                  : 'border-white/25 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={it.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtShowcase;
