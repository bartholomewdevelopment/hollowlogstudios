import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { TagOption } from '@/types';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

// Default tags if none exist in Firestore
const DEFAULT_TAGS = [
  'Print - For Sale',
  'Original - For Sale',
  'Sold',
  'Commission',
  'Personal',
  'Mural',
  'Cryptid',
  'Pebblewick'
];

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        setIsLoading(true);

        // Try to fetch tags from Firestore
        const tagsQuery = query(collection(db, 'tags'), orderBy('name'));
        const snapshot = await getDocs(tagsQuery);

        let tagOptions: TagOption[];

        if (snapshot.empty) {
          // Use default tags if no tags in database
          tagOptions = DEFAULT_TAGS.map(tag => ({
            value: tag,
            label: tag
          }));
        } else {
          tagOptions = snapshot.docs.map(doc => ({
            value: doc.data().name,
            label: doc.data().name
          }));
        }

        setAvailableTags(tagOptions);
      } catch (err) {
        console.error('Error fetching tags:', err);
        // Fall back to default tags on error
        setAvailableTags(DEFAULT_TAGS.map(tag => ({
          value: tag,
          label: tag
        })));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTags();
  }, []);

  const handleTagChange = (tagValue: string, isChecked: boolean) => {
    if (isChecked) {
      onChange([...selectedTags, tagValue]);
    } else {
      onChange(selectedTags.filter(tag => tag !== tagValue));
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading tags...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="font-medium">Select Tags</div>
      <div className="grid grid-cols-1 gap-3">
        {availableTags.map((tag) => (
          <div key={tag.value} className="flex items-center space-x-2">
            <Checkbox
              id={`tag-${tag.value}`}
              checked={selectedTags.includes(tag.value)}
              onCheckedChange={(checked) => handleTagChange(tag.value, checked as boolean)}
            />
            <Label htmlFor={`tag-${tag.value}`} className="cursor-pointer">
              {tag.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
