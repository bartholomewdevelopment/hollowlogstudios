import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { getArtistProfile } from '@/firebase/artistService';
import type { ArtistProfile } from '@/firebase/artistService';
import beatrixPotterPortrait from '@/assets/influences/beatrix-potter.png';

const AboutArtist: React.FC = () => {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f8f1e7] via-[#f4efe4] to-[#e6f0e1] py-14">
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

            <div className="rounded-[24px] border border-[#e3dccf] bg-gradient-to-br from-white/85 to-[#f3efe6] p-6 shadow-[0_14px_34px_rgba(64,50,33,0.1)]">
              <h3 className="text-xl font-griffy text-[#245b3f]">Inspiration</h3>
              <p className="mt-2 text-sm text-[#4b4a3f]">
                Nature, cultural diversity, and childhood imagination in rural Ohio.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    name: 'Beatrix Potter',
                    note: 'Nature-rooted storytelling with a tender hand.',
                    image_url: beatrixPotterPortrait,
                  },
                  {
                    name: 'Leo & Diane Dillon',
                    note: 'Lyrical color and generous representation.',
                  },
                  {
                    name: 'N.C. Wyeth',
                    note: 'Cinematic composition and warm atmosphere.',
                  },
                  {
                    name: 'Maurice Sendak',
                    note: 'Whimsy with a hint of wildness.',
                  },
                  {
                    name: 'James C. Christensen',
                    note: 'Mythic charm with intricate detail.',
                  },
                  {
                    name: 'Thomas Blackshear',
                    note: 'Elegant figures and soulful expressions.',
                  },
                  {
                    name: 'Norman Rockwell',
                    note: 'Everyday stories rendered with heart.',
                  },
                  {
                    name: 'The Leyendecker Brothers',
                    note: 'Classic illustration drama and flow.',
                  },
                ].map((artist) => (
                  <div
                    key={artist.name}
                    className="group relative overflow-hidden rounded-2xl border border-[#e2d6c2] bg-white/80 p-4 shadow-[0_10px_24px_rgba(64,50,33,0.08)]"
                  >
                    <div className="pointer-events-none absolute -left-6 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,191,111,0.35),transparent_70%)] blur-xl" />
                    <div className="pointer-events-none absolute -bottom-8 -right-6 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(35,136,48,0.2),transparent_70%)] blur-2xl" />
                    <div className="relative flex items-start gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[#d9cbb0] bg-[#f6f1e7] text-[10px] uppercase tracking-[0.2em] text-[#6b5f4a] flex items-center justify-center">
                        {artist.image_url ? (
                          <img
                            src={artist.image_url}
                            alt={`${artist.name} portrait`}
                            className="h-full w-full object-cover grayscale-[30%]"
                          />
                        ) : (
                          artist.name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#3f4a45]">{artist.name}</div>
                        <p className="mt-1 text-xs text-[#6a5c4a] leading-relaxed">{artist.note}</p>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#f1c27b] via-[#b7d3a1] to-transparent opacity-70" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutArtist;
