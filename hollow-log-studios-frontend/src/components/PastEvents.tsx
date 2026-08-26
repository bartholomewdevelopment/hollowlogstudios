import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { StudioEvent } from '@/types';
import { getPastEvents } from '@/firebase/eventService';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: '📸', Facebook: '📘', TikTok: '🎵', 'Twitter/X': '🐦',
  YouTube: '▶️', Website: '🌐', Eventbrite: '🎟️', Other: '🔗',
};

const PastEventCard: React.FC<{ event: StudioEvent }> = ({ event }) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const photos = event.post_event_images.length > 0
    ? event.post_event_images
    : event.pre_event_images;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Photo grid — post-event preferred, fall back to pre-event */}
      {photos.length > 0 && (
        <div className={`grid gap-0.5 ${photos.length === 1 ? 'grid-cols-1' : photos.length >= 4 ? 'grid-cols-2' : `grid-cols-${Math.min(photos.length, 3)}`}`}>
          {photos.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxImg(img)}
              className="overflow-hidden cursor-pointer focus:outline-none relative"
              aria-label="View photo"
            >
              <img
                src={img}
                alt=""
                className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* "+N more" overlay on last visible */}
              {i === 3 && photos.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                  +{photos.length - 4} more
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        <h3 className="text-lg font-bold font-griffy text-gray-800 mb-2">{event.name}</h3>

        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />{formatDate(event.date)}
          </span>
          {event.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />{event.address}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-3">{event.description}</p>
        )}

        {event.social_links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.social_links.filter(l => l.url).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span>{PLATFORM_ICONS[link.platform] ?? '🔗'}</span>
                {link.platform}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};

const PastEvents: React.FC = () => {
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPastEvents()
      .then(setEvents)
      .catch(err => console.error('Failed to load past events:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || events.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold griffy-text mb-2">Past Events</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A look back at where Bethany has been.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <PastEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PastEvents;
