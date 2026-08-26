import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { Influence } from '@/types';
import {
  getAllInfluences,
  createInfluence,
  updateInfluence,
  deleteInfluence,
  seedDefaultInfluences,
} from '@/firebase/influenceService';
import { Pencil, Trash2, Plus, X, Check, Download, Loader2 } from 'lucide-react';

interface FormState {
  name: string;
  note: string;
  image_url: string;
}

const EMPTY: FormState = { name: '', note: '', image_url: '' };

const InfluenceForm: React.FC<{
  initial?: FormState;
  saving: boolean;
  onSave: (data: FormState) => Promise<void>;
  onCancel: () => void;
}> = ({ initial = EMPTY, saving, onSave, onCancel }) => {
  const [form, setForm] = useState<FormState>(initial);
  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        if (!form.name.trim() || !form.note.trim()) return;
        await onSave(form);
      }}
      className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-5"
    >
      <div className="space-y-1">
        <Label htmlFor="inf-name">Name</Label>
        <Input
          id="inf-name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Maurice Sendak"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="inf-note">What she takes from them</Label>
        <Textarea
          id="inf-note"
          value={form.note}
          onChange={e => set('note', e.target.value)}
          placeholder="Whimsy with a hint of wildness."
          rows={2}
          required
        />
      </div>

      <div className="space-y-1">
        <Label>Portrait</Label>
        <ImageUpload
          value={form.image_url}
          onChange={url => set('image_url', url)}
          bucket="influences"
        />
        <p className="text-xs text-gray-500">
          Optional. Without one the card shows the artist&rsquo;s initials.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          <X className="mr-1 h-4 w-4" /> Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving || !form.name.trim() || !form.note.trim()}
          className="bg-[#238830] text-white hover:bg-green-700"
        >
          <Check className="mr-1 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export const InfluenceList: React.FC = () => {
  const { toast } = useToast();
  const [influences, setInfluences] = useState<Influence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Influence | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    try {
      setInfluences(await getAllInfluences());
    } catch {
      toast({ title: 'Error', description: 'Failed to load inspirations.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (form: FormState) => {
    setSaving(true);
    try {
      const payload = { name: form.name, note: form.note, image_url: form.image_url || null };
      if (editing) {
        await updateInfluence(editing.id, payload);
        toast({ title: 'Inspiration updated' });
      } else {
        await createInfluence(payload);
        toast({ title: 'Inspiration added' });
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (influence: Influence) => {
    if (!confirm(`Remove ${influence.name}?`)) return;
    try {
      await deleteInfluence(influence.id);
      setInfluences(prev => prev.filter(i => i.id !== influence.id));
      toast({ title: 'Inspiration removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove.', variant: 'destructive' });
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const added = await seedDefaultInfluences();
      toast({
        title: added > 0 ? `Imported ${added}` : 'Nothing to import',
        description:
          added > 0
            ? 'The original eight artists are now editable here.'
            : 'They are all already in the list.',
      });
      await load();
    } catch {
      toast({ title: 'Error', description: 'Import failed.', variant: 'destructive' });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div>Loading inspirations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Inspiration</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seeding}>
            {seeding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Import original eight
          </Button>
          {!showForm && (
            <Button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="bg-[#238830] text-white hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Inspiration
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <InfluenceForm
          initial={
            editing
              ? { name: editing.name, note: editing.note, image_url: editing.image_url || '' }
              : EMPTY
          }
          saving={saving}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {influences.map(influence => (
          <Card key={influence.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {influence.image_url ? (
                  <img
                    src={influence.image_url}
                    alt={influence.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800">{influence.name}</p>
                <p className="text-sm text-gray-600">{influence.note}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(influence);
                    setShowForm(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(influence)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {influences.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No inspirations yet. Use <strong>Import original eight</strong> to bring in the
            artists that were previously built into the About page.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InfluenceList;
