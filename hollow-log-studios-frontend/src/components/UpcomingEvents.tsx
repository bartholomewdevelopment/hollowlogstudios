import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, ExternalLink } from 'lucide-react';
import { StudioEvent } from '@/types';
import { getUpcomingEvents } from '@/firebase/eventService';

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: '📸', Facebook: '📘', TikTok: '🎵', 'Twitter/X': '🐦',
  YouTube: '▶️', Website: '🌐', Eventbrite: '🎟️', Other: '🔗',
};

const EventCard: React.FC<{ event: StudioEvent }> = ({ event }) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
      {/* Pre-event image strip */}
      {event.pre_event_images.length > 0 && (
        <div className={`grid gap-1 ${event.pre_event_images.length === 1 ? 'grid-cols-1' : event.pre_event_images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {event.pre_event_images.slice(0, 3).map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxImg(img)}
              className="overflow-hidden cursor-pointer focus:outline-none"
              aria-label="View image"
            >
              <img
                src={img}
                alt=""
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold font-griffy text-green-800 mb-3">{event.name}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="h-4 w-4 text-[#238830] shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.time && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="h-4 w-4 text-[#238830] shrink-0" />
              <span>{event.time}</span>
            </div>
          )}
          {event.address && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="h-4 w-4 text-[#238830] shrink-0" />
              <span>{event.address}</span>
            </div>
          )}
          {event.cost && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <DollarSign className="h-4 w-4 text-[#238830] shrink-0" />
              <span>{event.cost}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{event.description}</p>
        )}

        {event.social_links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.social_links.filter(l => l.url).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <span>{PLATFORM_ICONS[link.platform] ?? '🔗'}</span>
                {link.platform}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
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

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingEvents()
      .then(setEvents)
      .catch(err => console.error('Failed to load upcoming events:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || events.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold griffy-text mb-2">Upcoming Events</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Come meet Bethany in person — signings, art shows, and more.
          </p>
        </div>

        <div className={`grid gap-6 ${events.length === 1 ? 'max-w-xl mx-auto' : events.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
