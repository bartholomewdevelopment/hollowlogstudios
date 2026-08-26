import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudioEvent } from '@/types';
import { getAllEvents, deleteEvent } from '@/firebase/eventService';
import EventForm from './EventForm';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Calendar, Clock, MapPin, DollarSign } from 'lucide-react';

function isPast(date: string): boolean {
  return date < new Date().toISOString().split('T')[0];
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

const EventList: React.FC = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudioEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load events.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = () => { setSelected(null); setIsFormOpen(true); };
  const handleEdit = (e: StudioEvent) => { setSelected(e); setIsFormOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Event deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete event.', variant: 'destructive' });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    load();
  };

  if (loading) return <div>Loading events...</div>;

  const upcoming = events.filter(e => !isPast(e.date));
  const past     = events.filter(e =>  isPast(e.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events</h2>
        <Button onClick={handleAdd} className="bg-[#238830] hover:bg-green-700 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {/* Upcoming */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Upcoming ({upcoming.length})</h3>
        <div className="space-y-3">
          {upcoming.length === 0 && (
            <p className="text-gray-400 text-sm">No upcoming events.</p>
          )}
          {upcoming.map(event => (
            <EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Past ({past.length})</h3>
          <div className="space-y-3">
            {past.map(event => (
              <EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No events yet. Add your first one!
          </CardContent>
        </Card>
      )}

      {/* Form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <EventForm
            event={selected ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EventCard: React.FC<{
  event: StudioEvent;
  onEdit: (e: StudioEvent) => void;
  onDelete: (id: string) => void;
}> = ({ event, onEdit, onDelete }) => {
  const past = isPast(event.date);
  return (
    <Card className={past ? 'opacity-70' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-800">{event.name}</span>
              <Badge variant={past ? 'outline' : 'default'} className={past ? '' : 'bg-[#238830]'}>
                {past ? 'Past' : 'Upcoming'}
              </Badge>
              {event.cost && (
                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                  <DollarSign className="h-3 w-3" />{event.cost}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.date)}</span>
              {event.time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.time}</span>}
              {event.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.address}</span>}
            </div>
            <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
              {event.pre_event_images.length > 0 && <span>{event.pre_event_images.length} pre-event image{event.pre_event_images.length > 1 ? 's' : ''}</span>}
              {event.post_event_images.length > 0 && <span>{event.post_event_images.length} post-event image{event.post_event_images.length > 1 ? 's' : ''}</span>}
              {event.social_links.length > 0 && <span>{event.social_links.length} social link{event.social_links.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(event.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventList;
