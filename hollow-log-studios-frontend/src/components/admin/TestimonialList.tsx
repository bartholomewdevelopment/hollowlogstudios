import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Testimonial } from '@/types';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/firebase/testimonialService';
import { Pencil, Trash2, Plus, Star, X, Check } from 'lucide-react';

const EMPTY_FORM = { name: '', text: '', stars: 5, type: 'Commission' };

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="cursor-pointer focus:outline-none"
        aria-label={`${n} star${n !== 1 ? 's' : ''}`}
      >
        <Star className={`h-6 w-6 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      </button>
    ))}
  </div>
);

interface FormState {
  name: string;
  text: string;
  stars: number;
  type: string;
}

const TestimonialForm: React.FC<{
  initial?: FormState;
  onSave: (data: FormState) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}> = ({ initial = EMPTY_FORM, onSave, onCancel, saving }) => {
  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-green-200 rounded-lg p-5 bg-green-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="t-name">Customer Name</Label>
          <Input
            id="t-name"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Sarah M."
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="t-type">Type</Label>
          <Select value={form.type} onValueChange={v => set('type', v)}>
            <SelectTrigger id="t-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Commission">Commission</SelectItem>
              <SelectItem value="Book Purchase">Book Purchase</SelectItem>
              <SelectItem value="Print Purchase">Print Purchase</SelectItem>
              <SelectItem value="Original Purchase">Original Purchase</SelectItem>
              <SelectItem value="Mural">Mural</SelectItem>
              <SelectItem value="Merchandise">Merchandise</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Rating</Label>
        <StarPicker value={form.stars} onChange={v => set('stars', v)} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="t-text">Testimonial</Label>
        <Textarea
          id="t-text"
          value={form.text}
          onChange={e => set('text', e.target.value)}
          placeholder="What did the customer say?"
          rows={3}
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button type="submit" disabled={saving || !form.name.trim() || !form.text.trim()} className="bg-[#238830] hover:bg-green-700 text-white">
          <Check className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export const TestimonialList: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form: FormState) => {
    setSaving(true);
    try {
      if (editing) {
        await updateTestimonial(editing.id, form);
        setTestimonials(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } : t));
      } else {
        const created = await createTestimonial(form);
        setTestimonials(prev => [created, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      console.error('Error saving testimonial:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t: Testimonial) => {
    setEditing(t);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  if (loading) return <div>Loading testimonials...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Testimonials</h2>
        {!showForm && (
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-[#238830] hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Testimonial
          </Button>
        )}
      </div>

      {showForm && (
        <TestimonialForm
          initial={editing ? { name: editing.name, text: editing.text, stars: editing.stars, type: editing.type } : EMPTY_FORM}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      )}

      <div className="grid gap-4">
        {testimonials.map(t => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-800">{t.name}</span>
                    <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      {t.type}
                    </span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= t.stars ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No testimonials yet. Add your first one!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
