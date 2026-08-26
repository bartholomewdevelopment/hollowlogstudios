import React from 'react';

/**
 * Portraits are picked up automatically from src/assets/influences/.
 * To add one, drop in a file named after the artist in kebab-case —
 * "maurice-sendak.png", "n-c-wyeth.jpg" — and it appears here. No code
 * change needed. Until then the card shows a monogram.
 */
const portraitFiles = import.meta.glob('../assets/influences/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const portraits: Record<string, string> = Object.fromEntries(
  Object.entries(portraitFiles).map(([path, url]) => {
    const stem = path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
    return [stem, url];
  })
);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Influence {
  name: string;
  note: string;
}

const INFLUENCES: Influence[] = [
  { name: 'Beatrix Potter', note: 'Nature-rooted storytelling with a tender hand.' },
  { name: 'Leo & Diane Dillon', note: 'Lyrical color and generous representation.' },
  { name: 'N.C. Wyeth', note: 'Cinematic composition and warm atmosphere.' },
  { name: 'Maurice Sendak', note: 'Whimsy with a hint of wildness.' },
  { name: 'James C. Christensen', note: 'Mythic charm with intricate detail.' },
  { name: 'Thomas Blackshear', note: 'Elegant figures and soulful expressions.' },
  { name: 'Norman Rockwell', note: 'Everyday stories rendered with heart.' },
  { name: 'The Leyendecker Brothers', note: 'Classic illustration drama and flow.' },
];

function initials(name: string): string {
  return name
    .replace(/^The\s+/i, '')
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

const InfluenceCard: React.FC<{ influence: Influence }> = ({ influence }) => {
  const src = portraits[slugify(influence.name)];

  return (
    <figure className="group flex flex-col overflow-hidden rounded-[22px] border border-[#e3dccf] bg-white/85 shadow-[0_12px_30px_rgba(64,50,33,0.10)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(64,50,33,0.18)]">
      {/* Portrait — the card leads with the face */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#f6f1e7] via-[#f3efe6] to-[#e9efe4]">
        {src ? (
          <img
            src={src}
            alt={`${influence.name} portrait`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-griffy text-4xl text-[#b9ac93]">{initials(influence.name)}</span>
          </div>
        )}

        {/* Soft watercolour bloom in the corners */}
        <div className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,191,111,0.40),transparent_70%)] blur-xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(35,136,48,0.22),transparent_70%)] blur-2xl" />
      </div>

      <figcaption className="flex flex-1 flex-col p-4 text-center">
        <h4 className="font-griffy text-lg leading-snug text-[#245b3f]">{influence.name}</h4>
        <p className="mt-2 text-xs leading-relaxed text-[#6a5c4a]">{influence.note}</p>
      </figcaption>

      <div className="h-1 w-full bg-gradient-to-r from-[#f1c27b] via-[#b7d3a1] to-transparent opacity-80" />
    </figure>
  );
};

/** Full-width so the portraits have room to breathe — this used to sit in a
 *  narrow side column, four across, which squeezed each card to ~130px. */
const Influences: React.FC = () => (
  <section className="bg-gradient-to-b from-[#f4efe4] to-[#eef3ea] py-16">
    <div className="container mx-auto max-w-6xl px-4">
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d7d1c4] bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-[#6b5f4a] shadow-sm">
          Inspiration
        </span>
        <h2 className="mt-5 font-griffy text-4xl text-[#245b3f] md:text-5xl">
          Painters She Learned From
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[#3f4a45]">
          Nature, cultural diversity, and childhood imagination in rural Ohio &mdash; and
          the illustrators whose work taught her how a picture can hold a story.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {INFLUENCES.map(influence => (
          <InfluenceCard key={influence.name} influence={influence} />
        ))}
      </div>
    </div>
  </section>
);

export default Influences;
