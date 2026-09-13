import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Pause, Play } from 'lucide-react';

export interface ShowcaseItem {
  url: string;
  /** Small version for the filmstrip; falls back to url. */
  thumb?: string;
  href: string;
  label: string;
  /** "Painting", "Book", "Mural", "Character" — shown above the title. */
  kind: string;
  /** Where it came from, so an admin selection can be matched back to it. */
  source_type?: string;
  source_id?: string;
}

const INTERVAL_MS = 6000;

/** Softens the neighbouring pieces into the page at either edge. */
const EDGE_FADE = 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)';

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

const pad = (n: number) => String(n).padStart(2, '0');

const controlClass =
  'flex h-9 w-9 items-center sm:h-10 sm:w-10 justify-center rounded-full border border-stone-300 text-stone-700 transition hover:border-stone-900 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2';

/**
 * A quiet, gallery-style showcase: the work carries the colour and the frame
 * stays out of the way. Title and controls sit above, the piece is shown
 * large with its neighbours faded either side, and the caption sits below.
 */
const ArtShowcase: React.FC<{
  items: ShowcaseItem[];
  /** Opens the piece in place; without it, "View" goes to item.href. */
  onView?: (item: ShowcaseItem) => void;
}> = ({ items, onView }) => {
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  // Paused by the visitor, versus held while they hover or focus inside —
  // kept apart so the pause button shows what the visitor chose.
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => setCurrent((next + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (paused || held || reducedMotion || items.length < 2) return;
    const id = setTimeout(() => go(current + 1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [current, paused, held, reducedMotion, items.length, go]);

  // Keep the active thumbnail in view as the slide changes.
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.children[current] as HTMLElement | undefined;
    if (strip && active) {
      const left = active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2;
      strip.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }, [current, reducedMotion]);

  // Artwork files are heavy, so a slide's image is only requested once it is
  // current or beside it, and shown once fully loaded rather than painting in
  // line by line. Thumbnails wait until the first slide is up.
  const [requested, setRequested] = useState<Set<string>>(() => new Set());
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const [stripReady, setStripReady] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const near = [-1, 0, 1].map(d => items[(current + d + items.length) % items.length].url);
    setRequested(prev => (near.every(u => prev.has(u)) ? prev : new Set([...prev, ...near])));
  }, [current, items]);

  const markLoaded = (url: string) => {
    setLoaded(prev => (prev.has(url) ? prev : new Set(prev).add(url)));
    setStripReady(true);
  };

  if (items.length === 0) return null;
  const item = items[current];
  const many = items.length > 1;

  return (
    <div
      className="w-full"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected work"
    >
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">Portfolio</p>
          <h2 className="mt-2 font-griffy text-3xl leading-tight text-stone-900 md:text-4xl">
            Selected Work
          </h2>
        </div>

        {many && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-2 hidden text-sm tabular-nums text-stone-500 sm:inline" aria-hidden="true">
              {pad(current + 1)} <span className="text-stone-300">/</span> {pad(items.length)}
            </span>
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => setPaused(p => !p)}
                aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
                className={controlClass}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
            )}
            <button type="button" onClick={() => go(current - 1)} aria-label="Previous work" className={controlClass}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(current + 1)} aria-label="Next work" className={controlClass}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Stage — fixed height so nothing jumps as slides change */}
      <div
        className="relative h-[320px] overflow-x-clip sm:h-[440px] lg:h-[540px]"
        style={{ WebkitMaskImage: EDGE_FADE, maskImage: EDGE_FADE }}
      >
        {items.map((it, i) => {
          // Position relative to the current slide, wrapping around the ends
          // so the last piece waits beside the first.
          let offset = i - current;
          if (offset > items.length / 2) offset -= items.length;
          if (offset < -items.length / 2) offset += items.length;
          const isCurrent = offset === 0;
          const isNeighbour = Math.abs(offset) === 1;
          const clamped = Math.max(-2, Math.min(2, offset));

          return (
            <img
              key={it.url}
              src={requested.has(it.url) ? it.url : undefined}
              alt={isCurrent ? it.label : ''}
              aria-hidden={!isCurrent}
              decoding="async"
              onLoad={() => markLoaded(it.url)}
              onClick={isNeighbour ? () => go(i) : undefined}
              style={{
                transform: `translateX(calc(-50% + ${clamped * 66}%)) scale(${
                  isCurrent ? 1 : isNeighbour ? 0.78 : 0.65
                })`,
                opacity: !loaded.has(it.url) ? 0 : isCurrent ? 1 : isNeighbour ? 0.35 : 0,
                zIndex: isCurrent ? 20 : isNeighbour ? 10 : 0,
              }}
              className={`absolute left-1/2 top-0 h-full w-[72%] object-contain drop-shadow-[0_24px_28px_rgba(28,25,23,0.18)] ease-out sm:w-[56%] ${
                reducedMotion ? '' : 'transition-[transform,opacity] duration-700'
              } ${isNeighbour ? 'cursor-pointer hover:!opacity-60' : ''} ${
                !isCurrent && !isNeighbour ? 'pointer-events-none' : ''
              }`}
            />
          );
        })}

        {!loaded.has(item.url) && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-stone-400" aria-label="Loading artwork" />
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mx-auto mt-8 max-w-xl text-center md:mt-10" aria-live="polite">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500">{item.kind}</p>
        <h3 className="mt-2 text-xl font-semibold leading-snug text-stone-900 [text-wrap:balance] md:text-2xl">{item.label}</h3>
        <button
          type="button"
          onClick={() => (onView ? onView(item) : navigate(item.href))}
          className="group mt-3 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-[#238830] underline-offset-4 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#238830] focus-visible:ring-offset-2"
        >
          View {item.kind.toLowerCase()}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Filmstrip — sized to its content and centred, scrolling only when
          it runs out of room (justify-center would clip the first thumbs). */}
      {many && (
        <div
          ref={stripRef}
          className="mx-auto mt-8 flex w-fit max-w-full gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it, i) => (
            <button
              key={it.url}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${it.label}`}
              aria-current={i === current}
              className={`h-12 w-12 shrink-0 overflow-hidden rounded-md bg-stone-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                i === current
                  ? 'opacity-100 ring-2 ring-stone-900 ring-offset-2'
                  : 'opacity-40 hover:opacity-80'
              }`}
            >
              <img
                src={stripReady ? it.thumb || it.url : undefined}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtShowcase;
