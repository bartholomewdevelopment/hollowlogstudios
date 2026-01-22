import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getMurals, deleteMural } from '@/firebase/muralService';
import { Mural } from '@/types';
import MuralForm from './MuralForm';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function MuralList() {
  const [murals, setMurals] = useState<Mural[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMural, setSelectedMural] = useState<Mural | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const loadMurals = async () => {
    try {
      setLoading(true);
      const data = await getMurals();
      setMurals(data);
    } catch (error) {
      console.error('Failed to load murals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load murals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMurals();
  }, []);

  const handleEdit = (mural: Mural) => {
    setSelectedMural(mural);
    setIsAddingNew(false);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMural(null);
    setIsAddingNew(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mural?')) return;
    
    try {
      await deleteMural(id);
      setMurals(murals.filter(mural => mural.id !== id));
      toast({
        title: 'Success',
        description: 'Mural deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete mural:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete mural',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadMurals();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Murals</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Mural
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading murals...</div>
      ) : murals.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-gray-500">No murals found. Add your first mural!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {murals.map((mural) => (
            <div key={mural.id} className="border rounded-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={mural.image_url} 
                  alt={mural.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{mural.title}</h3>
                {mural.location && (
                  <p className="text-sm text-gray-600 mb-1">Location: {mural.location}</p>
                )}
                {mural.year && (
                  <p className="text-sm text-gray-600 mb-2">Year: {mural.year}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(mural)}
                    className="flex items-center gap-1 flex-1"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(mural.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isAddingNew ? 'Add New Mural' : 'Edit Mural'}
            </DialogTitle>
          </DialogHeader>
          <MuralForm 
            mural={selectedMural || undefined} 
            onSuccess={handleFormSuccess} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
