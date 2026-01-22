import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { getArtistProfile } from '@/firebase/artistService';
import type { ArtistProfile } from '@/firebase/artistService';

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
    <section className="py-12 bg-green-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 font-griffy">
          {profile?.name || 'Bethany Bartholomew'}
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-1/3 flex-shrink-0">
            <div className="aspect-square bg-green-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              {profile?.profile_image_url ? (
                <img 
                  src={profile.profile_image_url} 
                  alt={profile.name || 'Artist Portrait'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500">Artist Portrait</div>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-4 text-gray-700 leading-relaxed">
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
                
                <Separator className="my-6 bg-green-200" />
                
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
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-12 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <h3 className="text-xl font-semibold text-[#238830] mb-3 font-griffy">Mission</h3>
            <p className="text-gray-600 mb-4">Creating inclusive fairy tale art that represents children of all backgrounds through watercolor paintings featuring diverse characters in fantasy and fairy tale settings.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <h3 className="text-xl font-semibold text-[#238830] mb-3 font-griffy">Artistic Style</h3>
            <p className="text-gray-600 mb-4">Watercolor paintings with whimsical characters in enchanted forest settings, emphasizing cultural diversity and childhood wonder.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <h3 className="text-xl font-semibold text-[#238830] mb-2 font-griffy">Inspiration</h3>
            <p className="text-gray-600 mb-3">Nature, cultural diversity, and childhood imagination in rural Ohio</p>
            <div className="text-sm text-gray-500">
              <p className="font-medium mb-2 text-[#238830]">Artistic Influences:</p>
              <div className="space-y-1 leading-relaxed">
                <p>✨ <span className="italic">Beatrix Potter</span> - whimsical woodland tales</p>
                <p>🎨 <span className="italic">The Pre-Raphaelite Brotherhood</span> - romantic naturalism</p>
                <p>🌟 <span className="italic">Leo & Diane Dillon</span> - multicultural storytelling</p>
                <p>🏔️ <span className="italic">N.C. Wyeth</span> - epic adventure illustrations</p>
                <p>👑 <span className="italic">Trina Schart Hyman</span> - fairy tale mastery</p>
                <p>🌙 <span className="italic">Maurice Sendak</span> - childhood wonder & wildness</p>
                <p>🏰 <span className="italic">James C. Christensen</span> - fantastical worlds</p>
                <p>💫 <span className="italic">Thomas Blackshear</span> - spiritual storytelling</p>
                <p>🌸 <span className="italic">Edouard Monet</span> - impressionist light</p>
                <p>⚔️ <span className="italic">Howard Pyle</span> - golden age illustration</p>
                <p>🏡 <span className="italic">Norman Rockwell</span> - American life & character</p>
                <p>🎭 <span className="italic">The Leyendecker Brothers</span> - elegant commercial art</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutArtist;