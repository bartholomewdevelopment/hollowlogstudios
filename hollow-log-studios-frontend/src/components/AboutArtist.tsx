import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { getArtistProfile } from '@/firebase/artistService';
import { fetchBooks } from '@/firebase/bookService';
import { getAllCharacters } from '@/firebase/characterService';
import type { ArtistProfile } from '@/firebase/artistService';

const AboutArtist: React.FC = () => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ books: number; characters: number; worlds: number } | null>(null);

  useEffect(() => {
    Promise.allSettled([fetchBooks(), getAllCharacters()]).then(([books, characters]) => {
      const bookCount = books.status === 'fulfilled' ? books.value.length : 0;
      const chars = characters.status === 'fulfilled' ? characters.value : [];
      const worlds = new Set(
        chars.map(c => (c.character_type === 'cryptid' ? 'cryptid' : 'pebblewick'))
      ).size;
      setStats({ books: bookCount, characters: chars.length, worlds });
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getArtistProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching artist profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <section className="fairy-lattice relative overflow-hidden bg-gradient-to-br from-[#f8f1e7] via-[#f4efe4] to-[#e6f0e1] py-14">
      <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(35,136,48,0.25),transparent_70%)] blur-2xl animate-[float_10s_ease-in-out_infinite]" />
      <div className="absolute -bottom-24 left-[-5%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,191,111,0.35),transparent_70%)] blur-3xl animate-[float_12s_ease-in-out_infinite]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.6),transparent_40%,rgba(255,255,255,0.35))]" />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d7d1c4] bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-[#6b5f4a] shadow-sm">
            About the Artist
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-griffy text-[#245b3f]">
            {profile?.name || 'Bethany Bartholomew'}
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#3f4a45] max-w-2xl mx-auto">
            Watercolor dreamscapes rooted in folklore, family, and the natural rhythm of rural Ohio.
          </p>
        </div>

        {stats && (
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: String(stats.books), label: 'Picture books illustrated' },
              { value: String(stats.worlds), label: 'Original worlds' },
              { value: String(stats.characters), label: 'Characters created' },
              { value: 'Watercolor', label: 'Medium' },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-[18px] border border-[#e3dccf] bg-white/75 px-4 py-4 text-center shadow-[0_10px_26px_rgba(64,50,33,0.07)] backdrop-blur"
              >
                <div className="font-griffy text-2xl text-[#245b3f]">{stat.value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#6b5f4a]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-[1.1fr_1.5fr] gap-10 items-start">
          <div className="relative">
            <div className="absolute -left-6 top-8 h-full w-full rounded-[32px] border border-dashed border-[#d9cbb0] opacity-60" />
            <div className="relative rounded-[28px] bg-white/80 backdrop-blur border border-[#e3dccf] shadow-[0_18px_50px_rgba(64,50,33,0.12)] p-5">
              <div className="aspect-[4/5] rounded-[22px] bg-gradient-to-br from-[#f4eadb] via-[#f5f2e8] to-[#e4efe2] overflow-hidden flex items-center justify-center">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.name || 'Artist Portrait'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-[#7f7766] text-sm">Artist Portrait</div>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Watercolor', 'Storytelling', 'Inclusive Folklore'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-[#f2efe7] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#5c5142]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] bg-white/85 backdrop-blur border border-[#e3dccf] shadow-[0_16px_40px_rgba(64,50,33,0.1)] p-6">
              <h2 className="text-2xl font-griffy text-[#245b3f]">Story</h2>
              <Separator className="my-4 bg-[#e3dccf]" />
              <div className="prose prose-sm sm:prose-base max-w-none text-[#3f4a45]">
                {profile?.bio ? (
                  <div dangerouslySetInnerHTML={{ __html: profile.bio.replace(/\n/g, '<br/>') }} />
                ) : (
                  <>
                    <p>
                      Bethany Bartholomew was raised in rural Ohio, home schooled in a farm house. She loves to think back on her days playing in the mud, running through the woods, playing inside and around an old hollowed out log, all while letting her mind be carried away in thoughts of fairies and trolls and goblins and good witches and bad witches.
                    </p>
                    <p>
                      As the daughter of interracial parents, she has a love of cultural diversity. She has a knack for depicting race and culture within her work. She loves to include other ethnicities within her fairy tale pieces. Growing up, there was a lack of little girls who looked like her in storybooks, so she has focused on including everyone in her paintings.
                    </p>
                    <p>
                      She loves simple living, growing her own food, wearing vintage clothes, and shopping at Antique Malls and consignment stores, looking for just the right piece for her next art project, or for her studio. She is an experienced baker, seamstress and homemaker.
                    </p>
                    <p>
                      She is married and they now live in southeast Ohio. She is the proud mother of a little girl. They have two dogs named Diego and Pierre.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e3dccf] bg-gradient-to-br from-white/85 to-[#f3efe6] p-5 shadow-[0_10px_30px_rgba(64,50,33,0.08)]">
              <h3 className="text-lg font-griffy text-[#245b3f]">Currently</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4b4a3f]">
                Illustrating picture books with Sawdust Publishing, developing two original
                worlds &mdash; Pebblewick and the Hidden Cryptid Alliance &mdash; and seeking a
                literary agent for children&rsquo;s book work.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-[20px] border border-[#e3dccf] bg-white/80 p-5 shadow-[0_10px_30px_rgba(64,50,33,0.08)]">
                <h3 className="text-lg font-griffy text-[#245b3f]">Mission</h3>
                <p className="mt-2 text-sm text-[#4b4a3f] leading-relaxed">
                  Creating inclusive fairy tale art that represents children of all backgrounds through watercolor paintings featuring diverse characters in fantasy and fairy tale settings.
                </p>
              </div>
              <div className="rounded-[20px] border border-[#e3dccf] bg-white/80 p-5 shadow-[0_10px_30px_rgba(64,50,33,0.08)]">
                <h3 className="text-lg font-griffy text-[#245b3f]">Artistic Style</h3>
                <p className="mt-2 text-sm text-[#4b4a3f] leading-relaxed">
                  Watercolor paintings with whimsical characters in enchanted forest settings, emphasizing cultural diversity and childhood wonder.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutArtist;
