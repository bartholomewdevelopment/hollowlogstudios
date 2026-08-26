import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  getShowcaseSelection,
  saveShowcaseSelection,
  ShowcaseRef,
  ShowcaseSourceType,
} from '@/firebase/showcaseService';
import { fetchPaintings } from '@/firebase/galleryService';
import { fetchBooks } from '@/firebase/bookService';
import { getAllCharacters } from '@/firebase/characterService';
import { ArrowUp, ArrowDown, X, Plus, Loader2, RotateCcw } from 'lucide-react';

interface Candidate {
  source_type: ShowcaseSourceType;
  source_id: string;
  title: string;
  image_url: string;
  kind: string;
}

const key = (r: { source_type: string; source_id: string }) => `${r.source_type}:${r.source_id}`;

export const ShowcaseManager: React.FC = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<ShowcaseRef[]>([]);
  const [curated, setCurated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [books, paintings, characters, selection] = await Promise.all([
        fetchBooks().catch(() => []),
        fetchPaintings().catch(() => []),
        getAllCharacters().catch(() => []),
        getShowcaseSelection(),
      ]);

      const all: Candidate[] = [
        ...books
          .filter(b => b.image_url)
          .map(b => ({
            source_type: 'book' as const,
            source_id: b.id,
            title: b.title,
            image_url: b.image_url,
            kind: 'Book',
          })),
        ...characters
          .filter(c => c.image_url)
          .map(c => ({
            source_type: 'character' as const,
            source_id: c.id,
            title: c.name,
            image_url: c.image_url,
            kind: 'Character',
          })),
        ...paintings
          .filter(p => p.image_url)
          .map(p => ({
            source_type: 'painting' as const,
            source_id: p.id,
            title: p.title,
            image_url: p.image_url,
            kind: 'Painting',
          })),
      ];

      setCandidates(all);
      if (selection) {
        setSelected(selection);
        setCurated(true);
      } else {
        // Nothing curated yet — start from what the homepage shows today.
        setSelected(all.slice(0, 12).map(c => ({ source_type: c.source_type, source_id: c.source_id })));
      }
      setLoading(false);
    })();
  }, []);

  const byKey = useMemo(() => {
    const map: Record<string, Candidate> = {};
    candidates.forEach(c => {
      map[key(c)] = c;
    });
    return map;
  }, [candidates]);

  const selectedKeys = useMemo(() => new Set(selected.map(key)), [selected]);
  const available = candidates.filter(c => !selectedKeys.has(key(c)));

  const move = (index: number, delta: number) => {
    setSelected(prev => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const add = (c: Candidate) =>
    setSelected(prev => [...prev, { source_type: c.source_type, source_id: c.source_id }]);

  const remove = (index: number) => setSelected(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveShowcaseSelection(selected);
      setCurated(true);
      toast({
        title: 'Showcase saved',
        description: `${selected.length} item${selected.length === 1 ? '' : 's'} will appear on the homepage.`,
      });
    } catch {
      toast({ title: 'Error', description: 'Could not save the showcase.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Clear your selection and let the homepage choose automatically again?')) return;
    setSaving(true);
    try {
      await saveShowcaseSelection([]);
      setCurated(false);
      setSelected(
        candidates.slice(0, 12).map(c => ({ source_type: c.source_type, source_id: c.source_id }))
      );
      toast({ title: 'Back to automatic', description: 'The homepage will pick items itself.' });
    } catch {
      toast({ title: 'Error', description: 'Could not reset.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading showcase...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Homepage Showcase</h2>
          <p className="text-sm text-gray-500">
            {curated
              ? 'Showing your chosen items, in this order.'
              : 'Currently choosing automatically. Save to take control.'}
          </p>
        </div>
        <div className="flex gap-2">
          {curated && (
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              <RotateCcw className="mr-2 h-4 w-4" /> Back to automatic
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className="bg-[#238830] text-white hover:bg-green-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save showcase
          </Button>
        </div>
      </div>

      {/* Chosen, in order */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">
          In the showcase ({selected.length})
        </h3>
        {selected.length === 0 && (
          <p className="text-sm text-gray-400">
            Nothing selected. Add something below, or the section will be hidden.
          </p>
        )}
        <div className="space-y-2">
          {selected.map((ref, i) => {
            const c = byKey[key(ref)];
            return (
              <Card key={key(ref)}>
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="w-6 shrink-0 text-center text-sm font-semibold text-gray-400">
                    {i + 1}
                  </span>
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
                    {c ? (
                      <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800">
                      {c ? c.title : 'Item no longer exists'}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {c ? c.kind : ref.source_type}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="outline" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => move(i, 1)}
                      disabled={i === selected.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => remove(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Everything else */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">
          Available ({available.length})
        </h3>
        {available.length === 0 ? (
          <p className="text-sm text-gray-400">Everything is already in the showcase.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {available.map(c => (
              <button
                key={key(c)}
                type="button"
                onClick={() => add(c)}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition hover:border-[#238830] hover:shadow-md"
              >
                <div className="h-24 w-full overflow-hidden bg-gray-50">
                  <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-medium text-gray-800">{c.title}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Plus className="h-3 w-3" /> {c.kind}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowcaseManager;
