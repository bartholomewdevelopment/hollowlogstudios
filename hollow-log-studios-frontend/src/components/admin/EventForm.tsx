import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudioEvent, SocialLink } from '@/types';
import { createEvent, updateEvent } from '@/firebase/eventService';
import { uploadFile } from '@/lib/uploadHelpers';
import { HEIC_ACCEPT } from '@/lib/heic';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, X, Upload, Loader2 } from 'lucide-react';

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'Twitter/X', 'YouTube', 'Website', 'Eventbrite', 'Other'];

// ─── Multi-image upload section ───────────────────────────────────────────────
const MultiImageSection: React.FC<{
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  bucket: string;
}> = ({ label, images, onChange, bucket }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadFile(f, bucket)));
      onChange([...images, ...urls]);
      toast({ title: 'Uploaded', description: `${urls.length} image${urls.length > 1 ? 's' : ''} added.` });
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <label className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#238830] transition-colors text-sm text-gray-500 hover:text-[#238830] w-fit ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? 'Uploading...' : 'Add Images'}
        <input type="file" accept={`image/*,${HEIC_ACCEPT}`} multiple className="hidden" onChange={handleFiles} disabled={uploading} />
      </label>
    </div>
  );
};

// ─── Social links editor ──────────────────────────────────────────────────────
const SocialLinksEditor: React.FC<{
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}> = ({ links, onChange }) => {
  const add = () => onChange([...links, { platform: 'Instagram', url: '' }]);
  const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof SocialLink, value: string) => {
    const updated = links.map((l, idx) => idx === i ? { ...l, [field]: value } : l);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>Social Media Links</Label>
      {links.map((link, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Select value={link.platform} onValueChange={v => update(i, 'platform', v)}>
            <SelectTrigger className="w-36 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            value={link.url}
            onChange={e => update(i, 'url', e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => remove(i)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="flex items-center gap-1">
        <Plus className="h-4 w-4" /> Add Link
      </Button>
    </div>
  );
};

// ─── Main form ────────────────────────────────────────────────────────────────
interface EventFormProps {
  event?: StudioEvent;
  onSuccess: () => void;
  onCancel: () => void;
}

const EMPTY: Omit<StudioEvent, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  date: '',
  time: '',
  address: '',
  description: '',
  cost: '',
  social_links: [],
  pre_event_images: [],
  post_event_images: [],
};

const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const isEditing = !!event;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<StudioEvent, 'id' | 'created_at' | 'updated_at'>>({
    name:               event?.name               ?? EMPTY.name,
    date:               event?.date               ?? EMPTY.date,
    time:               event?.time               ?? EMPTY.time,
    address:            event?.address            ?? EMPTY.address,
    description:        event?.description        ?? EMPTY.description,
    cost:               event?.cost               ?? EMPTY.cost,
    social_links:       event?.social_links       ?? [],
    pre_event_images:   event?.pre_event_images   ?? [],
    post_event_images:  event?.post_event_images  ?? [],
  });

  const set = (field: keyof typeof form, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;
    setSaving(true);
    try {
      if (isEditing && event) {
        await updateEvent(event.id, form);
        toast({ title: 'Event updated' });
      } else {
        await createEvent(form);
        toast({ title: 'Event created' });
      }
      onSuccess();
    } catch {
      toast({ title: 'Error', description: 'Failed to save event.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="ev-name">Event Name *</Label>
        <Input id="ev-name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Art in the Park" required />
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="ev-date">Date *</Label>
          <Input id="ev-date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ev-time">Time</Label>
          <Input id="ev-time" value={form.time} onChange={e => set('time', e.target.value)} placeholder="2:00 PM – 5:00 PM" />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <Label htmlFor="ev-address">Address</Label>
        <Input id="ev-address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St, City, State" />
      </div>

      {/* Cost */}
      <div className="space-y-1">
        <Label htmlFor="ev-cost">Cost</Label>
        <Input id="ev-cost" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="Free, $10, Suggested donation" />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="ev-desc">Description</Label>
        <Textarea id="ev-desc" value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Tell people what to expect..." />
      </div>

      {/* Social links */}
      <SocialLinksEditor links={form.social_links} onChange={v => set('social_links', v)} />

      {/* Pre-event images */}
      <MultiImageSection
        label="Pre-Event Images (promo / flyer photos)"
        images={form.pre_event_images}
        onChange={v => set('pre_event_images', v)}
        bucket="events/pre"
      />

      {/* Post-event images */}
      <MultiImageSection
        label="Post-Event Images (photos from the event)"
        images={form.post_event_images}
        onChange={v => set('post_event_images', v)}
        bucket="events/post"
      />

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 border-t sticky bottom-0 bg-white pb-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !form.name.trim() || !form.date} className="bg-[#238830] hover:bg-green-700 text-white">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {saving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
