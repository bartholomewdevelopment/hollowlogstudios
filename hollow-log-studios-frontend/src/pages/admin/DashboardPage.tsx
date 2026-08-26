import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaintingList } from '@/components/admin/PaintingList';
import { BookList } from '@/components/admin/BookList';
import { MerchandiseList } from '@/components/admin/MerchandiseList';
import MuralList from '@/components/admin/MuralList';
import CommissionRequests from '@/components/admin/CommissionRequests';
import { ArtistProfileForm } from '@/components/admin/ArtistProfileForm';
import AdminHeader from '@/components/admin/AdminHeader';
import { OrderHistoryList } from '@/components/admin/OrderHistoryList';
import { AbandonedCartsList } from '@/components/admin/AbandonedCartsList';
import { CharacterList } from '@/components/admin/CharacterList';
import { TestimonialList } from '@/components/admin/TestimonialList';
import EventList from '@/components/admin/EventList';
import { Painting, Book, Merchandise } from '@/types';
import DataLoadingStatus from '@/components/DataLoadingStatus';
import { fetchAllFromTable } from '@/firebase/dataFetcher';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaintingForm } from '@/components/admin/PaintingForm';
import { BookForm } from '@/components/admin/BookForm';
import { MerchandiseForm } from '@/components/admin/MerchandiseForm';
import { Plus } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('paintings');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMerchandise, setSelectedMerchandise] = useState<Merchandise | null>(null);
  const [dataStatus, setDataStatus] = useState({
    hasIssue: false,
    message: ''
  });
  const [isPaintingFormOpen, setIsPaintingFormOpen] = useState(false);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [isMerchandiseFormOpen, setIsMerchandiseFormOpen] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const checkDataAvailability = async () => {
      try {
        // Check if we have data in key tables
        const paintings = await fetchAllFromTable('paintings');
        const books = await fetchAllFromTable('books');
        const murals = await fetchAllFromTable('murals');
        
        const hasNoData = 
          (!paintings || paintings.length === 0) && 
          (!books || books.length === 0) && 
          (!murals || murals.length === 0);
        
        setDataStatus({
          hasIssue: hasNoData,
          message: hasNoData ? 'No data found in the database. This could be due to a connection issue.' : ''
        });
      } catch (error) {
        console.error('Error checking data availability:', error);
        setDataStatus({
          hasIssue: true,
          message: 'Error connecting to the database. Please check your connection.'
        });
      }
    };
    
    checkDataAvailability();
  }, [refreshTrigger]);

  const handleEditPainting = (painting: Painting) => {
    setSelectedPainting(painting);
    setIsPaintingFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setIsBookFormOpen(true);
  };

  const handleAddNewPainting = () => {
    setSelectedPainting(null);
    setIsPaintingFormOpen(true);
  };

  const handleAddNewBook = () => {
    setSelectedBook(null);
    setIsBookFormOpen(true);
  };

  const handleEditMerchandise = (merchandise: Merchandise) => {
    setSelectedMerchandise(merchandise);
    setIsMerchandiseFormOpen(true);
  };

  const handleAddNewMerchandise = () => {
    setSelectedMerchandise(null);
    setIsMerchandiseFormOpen(true);
  };

  const handlePaintingFormSuccess = () => {
    setIsPaintingFormOpen(false);
    handleRefresh();
  };

  const handleBookFormSuccess = () => {
    setIsBookFormOpen(false);
    handleRefresh();
  };

  const handleMerchandiseFormSuccess = () => {
    setIsMerchandiseFormOpen(false);
    handleRefresh();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Added AdminHeader component with Back to Website and Logout buttons */}
      <AdminHeader />
      
      {dataStatus.hasIssue && (
        <div className="mb-6">
          <DataLoadingStatus onRefresh={handleRefresh} />
        </div>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
          <TabsTrigger value="paintings">Paintings</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="murals">Murals</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="carts">Abandoned Carts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="artist">Artist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="characters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Characters</CardTitle>
              <CardDescription>
                Add, edit, or remove cryptids and pebblewick characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CharacterList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="merchandise" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Merchandise</CardTitle>
                <CardDescription>
                  Add, edit, or remove merchandise items from your shop.
                </CardDescription>
              </div>
              <Button onClick={handleAddNewMerchandise} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Merchandise
              </Button>
            </CardHeader>
            <CardContent>
              <MerchandiseList 
                onEdit={handleEditMerchandise} 
                refreshTrigger={refreshTrigger} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paintings" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Paintings</CardTitle>
                <CardDescription>
                  Add, edit, or remove paintings from your gallery.
                </CardDescription>
              </div>
              <Button onClick={handleAddNewPainting} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Painting
              </Button>
            </CardHeader>
            <CardContent>
              <PaintingList 
                onEdit={handleEditPainting} 
                refreshTrigger={refreshTrigger} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Books</CardTitle>
                <CardDescription>
                  Add, edit, or remove books from your collection.
                </CardDescription>
              </div>
              <Button onClick={handleAddNewBook} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </CardHeader>
            <CardContent>
              <BookList 
                onEdit={handleEditBook} 
                refreshTrigger={refreshTrigger} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="murals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Murals</CardTitle>
              <CardDescription>
                Add, edit, or remove murals from your portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MuralList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Commissions</CardTitle>
              <CardDescription>
                View and respond to commission requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionRequests 
                refreshTrigger={refreshTrigger}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View all completed purchases and order details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderHistoryList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abandoned Carts</CardTitle>
              <CardDescription>
                View carts that were created but never completed checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AbandonedCartsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Events</CardTitle>
              <CardDescription>
                Add upcoming events shown on the homepage. Past events automatically move to the About page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Testimonials</CardTitle>
              <CardDescription>
                Add, edit, or remove customer testimonials shown on the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Artist Profile</CardTitle>
              <CardDescription>
                Update your profile information and photo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArtistProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Painting Form Dialog */}
      <Dialog open={isPaintingFormOpen} onOpenChange={setIsPaintingFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPainting ? 'Edit Painting' : 'Add New Painting'}
            </DialogTitle>
          </DialogHeader>
          <PaintingForm
            painting={selectedPainting || undefined}
            onSuccess={handlePaintingFormSuccess}
            onCancel={() => setIsPaintingFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Book Form Dialog */}
      <Dialog open={isBookFormOpen} onOpenChange={setIsBookFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBook ? 'Edit Book' : 'Add New Book'}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            book={selectedBook || undefined}
            onSuccess={handleBookFormSuccess}
            onCancel={() => setIsBookFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Merchandise Form Dialog */}
      <Dialog open={isMerchandiseFormOpen} onOpenChange={setIsMerchandiseFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMerchandise ? 'Edit Merchandise' : 'Add New Merchandise'}
            </DialogTitle>
          </DialogHeader>
          <MerchandiseForm
            merchandise={selectedMerchandise || undefined}
            onSuccess={handleMerchandiseFormSuccess}
            onCancel={() => setIsMerchandiseFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;