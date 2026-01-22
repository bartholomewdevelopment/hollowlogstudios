import { useState, useEffect } from 'react';
import { Mural } from '@/types';
import { getMurals } from '@/firebase/muralService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MuralDetailModal from './MuralDetailModal';

export default function MuralSection() {
  const [murals, setMurals] = useState<Mural[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMural, setSelectedMural] = useState<Mural | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadMurals() {
      try {
        const data = await getMurals();
        setMurals(data);
      } catch (error) {
        console.error('Failed to load murals:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMurals();
  }, []);

  const handleViewDetails = (mural: Mural) => {
    setSelectedMural(mural);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMural(null), 300);
  };

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center griffy-text">Murals</h2>
          <div className="flex justify-center">
            <p>Loading murals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (murals.length === 0) {
    return (
      <div className="w-full py-12">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center griffy-text">Murals</h2>
          <div className="flex justify-center">
            <p>No murals available at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8 text-center griffy-text">Murals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {murals.map((mural) => (
            <Card key={mural.id} className="overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={mural.image_url} 
                  alt={mural.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{mural.title}</h3>
                {mural.location && (
                  <p className="text-sm text-gray-600 mb-1">Location: {mural.location}</p>
                )}
                {mural.year && (
                  <p className="text-sm text-gray-600 mb-3">Year: {mural.year}</p>
                )}
                <Button 
                  onClick={() => handleViewDetails(mural)}
                  variant="outline"
                  className="w-full mt-2 border-[#238830] text-[#238830] hover:bg-green-50"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mural Detail Modal */}
      <MuralDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mural={selectedMural}
      />
    </div>
  );
}