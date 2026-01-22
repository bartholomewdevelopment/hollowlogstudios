import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Character } from '@/types';
import { createCharacter, updateCharacter } from '@/firebase/characterService';
import { ImageUpload } from './ImageUpload';

interface CharacterFormProps {
  character?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({ character, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bio: '',
    artist_notes: '',
    image_url: '',
    character_type: 'cryptid' as 'cryptid' | 'pebblewick',
    status: 'upcoming' as 'current' | 'upcoming',
    has_video_story: false,
    youtube_url: '',
    printful_store_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        description: character.description || '',
        bio: character.bio || '',
        artist_notes: character.artist_notes || '',
        image_url: character.image_url || '',
        character_type: character.character_type,
        status: character.status,
        has_video_story: character.has_video_story,
        youtube_url: character.youtube_url || '',
        printful_store_url: character.printful_store_url || ''
      });
    }
  }, [character]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedCharacter;
      if (character) {
        savedCharacter = await updateCharacter(character.id, formData);
      } else {
        savedCharacter = await createCharacter(formData);
      }
      onSave(savedCharacter);
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{character ? 'Edit Character' : 'Add New Character'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Character biography for modal display..."
            />
          </div>

          <div>
            <Label htmlFor="artist_notes">Artist Notes</Label>
            <Textarea
              id="artist_notes"
              value={formData.artist_notes}
              onChange={(e) => setFormData({ ...formData, artist_notes: e.target.value })}
              rows={3}
              placeholder="Artist's notes about the character..."
            />
          </div>

          <div>
            <Label>Character Image</Label>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
              bucket="characters"
            />
          </div>

          <div>
            <Label htmlFor="character_type">Type</Label>
            <Select value={formData.character_type} onValueChange={(value: 'cryptid' | 'pebblewick') => setFormData({ ...formData, character_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cryptid">Cryptid</SelectItem>
                <SelectItem value="pebblewick">Pebblewick</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'current' | 'upcoming') => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="has_video_story"
              checked={formData.has_video_story}
              onCheckedChange={(checked) => setFormData({ ...formData, has_video_story: checked })}
            />
            <Label htmlFor="has_video_story">Has Video Story</Label>
          </div>

          {formData.has_video_story && (
            <div>
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}

          <div>
            <Label htmlFor="printful_store_url">Printful Store URL</Label>
            <Input
              id="printful_store_url"
              type="url"
              value={formData.printful_store_url}
              onChange={(e) => setFormData({ ...formData, printful_store_url: e.target.value })}
              placeholder="https://store.printful.com/..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Character'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};