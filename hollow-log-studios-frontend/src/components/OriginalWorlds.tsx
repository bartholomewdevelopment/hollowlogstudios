import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllCharacters } from '@/firebase/characterService';

interface World {
  key: 'pebblewick' | 'cryptid';
  name: string;
  tagline: string;
  blurb: string;
  href: string;
}

/** Her own story worlds. Published credits show she can execute; these show
 *  she can originate — which is what a literary agent is buying. */
const WORLDS: World[] = [
  {
    key: 'pebblewick',
    name: 'Pebblewick',
    tagline: 'A seaside village of magical animals',
    blurb:
      'Tucked along the coast, Pebblewick-by-the-Sea is home to animals with magic in them and a knack for finding adventure. A gentle, character-led world built for early readers and bedtime stories.',
    href: '/pebblewick',
  },
  {
    key: 'cryptid',
    name: 'The Hidden Cryptid Alliance',
    tagline: 'Cryptids reimagined as guardians',
    blurb:
      'The creatures of folklore, retold. The HCA casts cryptids not as monsters but as protectors who step out of the shadows to defend the natural world — a series with room to grow across many books.',
    href: '/cryptids',
  },
];

const OriginalWorlds: React.FC = () => {
  const navigate = useNavigate();
  const [thumbs, setThumbs] = useState<Record<string, string[]>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getAllCharacters()
      .then(chars => {
        const byWorld: Record<string, string[]> = {};
        const tally: Record<string, number> = {};
        chars.forEach(c => {
          const key = c.character_type === 'cryptid' ? 'cryptid' : 'pebblewick';
          tally[key] = (tally[key] ?? 0) + 1;
          if (c.image_url) {
            byWorld[key] = [...(byWorld[key] ?? []), c.image_url].slice(0, 3);
          }
        });
        setThumbs(byWorld);
        setCounts(tally);
      })
      .catch(err => console.error('Failed to load characters:', err));
  }, []);

  return (
    <section className="bg-gradient-to-b from-[#eef3ea] via-[#f6f2e8] to-[#f8f1e7] py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d7d1c4] bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-[#6b5f4a] shadow-sm">
            Original Worlds
          </span>
          <h2 className="mt-5 font-griffy text-4xl text-[#245b3f] md:text-5xl">
            Stories of Her Own
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#3f4a45]">
            Alongside her published illustration work, Bethany is developing two
            original worlds &mdash; characters, settings and stories built to carry a
            series.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {WORLDS.map(world => {
            const images = thumbs[world.key] ?? [];
            const count = counts[world.key] ?? 0;
            return (
              <article
                key={world.key}
                className="group flex flex-col overflow-hidden rounded-[24px] border border-[#e3dccf] bg-white/85 shadow-[0_16px_40px_rgba(64,50,33,0.10)] backdrop-blur transition hover:shadow-[0_22px_55px_rgba(64,50,33,0.16)]"
              >
                {images.length > 0 && (
                  <div className="flex gap-0.5 bg-[#f4eadb]">
                    {images.map((src, i) => (
                      <div key={i} className="flex-1 overflow-hidden">
                        <img
                          src={src}
                          alt=""
                          aria-hidden="true"
                          className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-griffy text-2xl leading-tight text-[#245b3f]">
                    {world.name}
                  </h3>
                  <p className="mt-1 text-sm uppercase tracking-widest text-[#6b5f4a]">
                    {world.tagline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#3f4a45]">{world.blurb}</p>

                  <div className="mt-auto flex items-center justify-between pt-5">
                    <button
                      type="button"
                      onClick={() => navigate(world.href)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#245b3f] hover:underline"
                    >
                      Meet the characters
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {count > 0 && (
                      <span className="text-xs uppercase tracking-widest text-[#6b5f4a]">
                        {count} character{count === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OriginalWorlds;
