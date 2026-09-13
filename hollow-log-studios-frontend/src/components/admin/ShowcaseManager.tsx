import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  getShowcaseSelection,
  requestWebImages,
  saveShowcaseSelection,
  ShowcaseRef,
  ShowcaseSourceType,
  WebImageTarget,
} from '@/firebase/showcaseService';
import { fetchPaintings } from '@/firebase/galleryService';
import { fetchBooks } from '@/firebase/bookService';
import { getAllCharacters } from '@/firebase/characterService';
import { getMurals } from '@/firebase/muralService';
import { thumbImage } from '@/lib/webImage';
import { ArrowUp, ArrowDown, X, Plus, Loader2, RotateCcw, Sparkles } from 'lucide-react';

interface Candidate {
  source_type: ShowcaseSourceType;
  source_id: string;
  title: string;
  image_url: string;
  kind: string;
  /** Ticked "Available for Showcase" on its own edit form. */
  tagged: boolean;
}

const key = (r: { source_type: string; source_id: string }) => `${r.source_type}:${r.source_id}`;

/** Mirrors the homepage's automatic choice in Hero.tsx. */
const automaticPicks = (all: Candidate[]): ShowcaseRef[] => {
  const tagged = all.filter(c => c.tagged);
  const pool = tagged.length > 0 ? tagged : all.filter(c => c.source_type !== 'mural');
  return pool.slice(0, 12).map(c => ({ source_type: c.source_type, source_id: c.source_id }));
};

export const ShowcaseManager: React.FC = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<ShowcaseRef[]>([]);
  const [curated, setCurated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Pieces whose web-sized copies are missing or out of date
  const [staleImages, setStaleImages] = useState<WebImageTarget[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    (async () => {
      const [books, paintings, characters, murals, selection] = await Promise.all([
        fetchBooks().catch(() => []),
        fetchPaintings().catch(() => []),
        getAllCharacters().catch(() => []),
        getMurals().catch(() => []),
        getShowcaseSelection(),
      ]);

      const all: Candidate[] = [
        ...books
          .filter(b => b.image_url)
          .map(b => ({
            source_type: 'book' as const,
            source_id: b.id,
            title: b.title,
            image_url: thumbImage(b),
            kind: 'Book',
            tagged: !!b.showcase,
          })),
        ...characters
          .filter(c => c.image_url)
          .map(c => ({
            source_type: 'character' as const,
            source_id: c.id,
            title: c.name,
            image_url: thumbImage(c),
            kind: 'Character',
            tagged: !!c.showcase,
          })),
        ...paintings
          .filter(p => p.image_url)
          .map(p => ({
            source_type: 'painting' as const,
            source_id: p.id,
            title: p.title,
            image_url: thumbImage(p),
            kind: 'Painting',
            tagged: !!p.showcase,
          })),
        ...murals
          .filter(m => m.image_url)
          .map(m => ({
            source_type: 'mural' as const,
            source_id: m.id,
            title: m.title,
            image_url: thumbImage(m),
            kind: 'Mural',
            tagged: !!m.showcase,
          })),
      ];

      setCandidates(all);

      const stale: WebImageTarget[] = [];
      let total = 0;
      const check = (
        collection: string,
        docs: { id: string; image_url?: string | null; image_web_source?: string }[]
      ) =>
        docs.forEach(d => {
          if (!d.image_url) return;
          total += 1;
          if (d.image_web_source !== d.image_url) stale.push({ collection, id: d.id });
        });
      check('books', books);
      check('characters', characters);
      check('paintings', paintings);
      check('murals', murals);
      setTotalImages(total);
      setStaleImages(stale);

      if (selection) {
        setSelected(selection);
        setCurated(true);
      } else {
        setSelected(automaticPicks(all));
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
  // Only work tagged "Available for Showcase" on its edit form is offered here.
  const available = candidates.filter(c => c.tagged && !selectedKeys.has(key(c)));

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
      setSelected(automaticPicks(candidates));
      toast({ title: 'Back to automatic', description: 'The homepage will pick items itself.' });
    } catch {
      toast({ title: 'Error', description: 'Could not reset.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrepareImages = async () => {
    setPreparing(true);
    try {
      await requestWebImages(staleImages);
      toast({
        title: 'Preparing web images',
        description: `${staleImages.length} image${staleImages.length === 1 ? '' : 's'} sent for resizing. Large scans can take a minute each.`,
      });
      setStaleImages([]);
    } catch {
      toast({ title: 'Error', description: 'Could not start preparing images.', variant: 'destructive' });
    } finally {
      setPreparing(false);
    }
  };

  if (loading) return <div>Loading showcase...</div>;

  return (
    <div className="space-y-8">
      {staleImages.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-amber-900">
                {staleImages.length} of {totalImages} images need web-sized copies
              </p>
              <p className="text-sm text-amber-800">
                Until they have them, the homepage loads the full-size originals, which can be very slow.
              </p>
            </div>
            <Button
              onClick={handlePrepareImages}
              disabled={preparing}
              variant="outline"
              className="border-amber-300 bg-white"
            >
              {preparing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Prepare web images
            </Button>
          </CardContent>
        </Card>
      )}

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
          <p className="text-sm text-gray-400">
            Nothing else is tagged. Tick "Available for Showcase" when editing a painting,
            mural, book or character to list it here.
          </p>
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
