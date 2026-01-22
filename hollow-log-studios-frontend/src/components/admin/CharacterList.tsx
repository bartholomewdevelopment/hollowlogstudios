import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '@/types';
import { getAllCharacters, deleteCharacter } from '@/firebase/characterService';
import { CharacterForm } from './CharacterForm';
import { Pencil, Trash2, Plus, Video } from 'lucide-react';

export const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const data = await getAllCharacters();
      setCharacters(data);
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this character?')) {
      try {
        await deleteCharacter(id);
        setCharacters(characters.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting character:', error);
      }
    }
  };

  const handleSave = (character: Character) => {
    if (editingCharacter) {
      setCharacters(characters.map(c => c.id === character.id ? character : c));
    } else {
      setCharacters([character, ...characters]);
    }
    setShowForm(false);
    setEditingCharacter(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCharacter(null);
  };

  if (loading) return <div>Loading characters...</div>;

  if (showForm) {
    return (
      <CharacterForm
        character={editingCharacter || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Characters</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="grid gap-4">
        {characters.map((character) => (
          <Card key={character.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {character.image_url && (
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{character.name}</h3>
                    <Badge variant={character.character_type === 'cryptid' ? 'default' : 'secondary'}>
                      {character.character_type}
                    </Badge>
                    <Badge variant={character.status === 'current' ? 'default' : 'outline'}>
                      {character.status}
                    </Badge>
                    {character.has_video_story && (
                      <Badge variant="secondary">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    )}
                  </div>
                  {character.description && (
                    <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                  )}
                  {character.youtube_url && (
                    <p className="text-xs text-blue-600">{character.youtube_url}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCharacter(character);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(character.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {characters.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No characters found. Add your first character!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};