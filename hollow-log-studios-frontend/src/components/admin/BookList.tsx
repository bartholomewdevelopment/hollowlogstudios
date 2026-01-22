import React, { useState, useEffect } from 'react';
import { getBooks } from '@/firebase/bookService';
import { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteBook } from '@/firebase/bookService';

interface BookListProps {
  onEdit: (book: Book) => void;
  refreshTrigger: number;
}

export function BookList({ onEdit, refreshTrigger }: BookListProps) {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await getBooks();
        setBooks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        setIsDeleting(id);
        const success = await deleteBook(id);
        
        if (success) {
          setBooks(books.filter(book => book.id !== id));
          toast({
            title: 'Book deleted',
            description: 'The book has been successfully deleted.',
          });
        } else {
          throw new Error('Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        toast({
          title: 'Error',
          description: 'There was an error deleting the book. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading books...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (books.length === 0) {
    return <div className="text-center py-4">No books found. Add your first book!</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <div className="h-12 w-12 overflow-hidden rounded">
                  <img 
                    src={book.image_url} 
                    alt={book.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell>{book.price ? `$${book.price}` : 'N/A'}</TableCell>
              <TableCell>{book.featured ? 'Yes' : 'No'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(book)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDelete(book.id)}
                    disabled={isDeleting === book.id}
                  >
                    {isDeleting === book.id ? (
                      <span className="h-4 w-4 animate-spin">⏳</span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
