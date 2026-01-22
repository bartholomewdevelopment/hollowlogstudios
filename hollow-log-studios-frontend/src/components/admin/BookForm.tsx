import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Book } from '@/types';
import { addBook, updateBook } from '@/firebase/bookService';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { MultiImageUpload } from '@/components/admin/MultiImageUpload';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  image_url: z.string().min(1, 'Main image is required'),
  gallery_images: z.array(z.string()).default([]),
  price: z.string().optional(),
  featured: z.boolean().default(false),
  publisher_available: z.boolean().default(false),
  publisher_link: z.string().optional(),
  publisher_in_stock: z.boolean().default(false),
  website_cart_available: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface BookFormProps {
  book?: Book;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: book?.title || '',
      description: book?.description || '',
      image_url: book?.image_url || '',
      gallery_images: book?.gallery_images || [],
      price: book?.price ? String(book.price) : '',
      featured: book?.featured || false,
      publisher_available: book?.publisher_available || false,
      publisher_link: book?.publisher_link || '',
      publisher_in_stock: book?.publisher_in_stock || false,
      website_cart_available: book?.website_cart_available ?? true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const bookData = {
        title: data.title,
        description: data.description || null,
        image_url: data.image_url,
        gallery_images: data.gallery_images.filter(url => url.trim() !== ''),
        price: data.price ? parseFloat(data.price) : null,
        featured: data.featured,
        publisher_available: data.publisher_available,
        publisher_link: data.publisher_link || null,
        publisher_in_stock: data.publisher_in_stock,
        website_cart_available: data.website_cart_available,
      };
      
      if (book) {
        await updateBook(book.id, bookData);
        toast({
          title: 'Book updated',
          description: 'The book has been successfully updated.',
        });
      } else {
        await addBook(bookData);
        toast({
          title: 'Book added',
          description: 'The book has been successfully added.',
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving book:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the book. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Book title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Book description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="29.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Book</FormLabel>
                <p className="text-sm text-gray-500">
                  This book will be displayed prominently in the featured section
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website_cart_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Available for Website Cart</FormLabel>
                <p className="text-sm text-gray-500">
                  Allow customers to add this book to their cart
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publisher_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Available from Publisher</FormLabel>
                <p className="text-sm text-gray-500">
                  Show publisher purchase option
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publisher_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publisher Link</FormLabel>
              <FormControl>
                <Input placeholder="https://publisher.com/book" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publisher_in_stock"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>In Stock at Publisher</FormLabel>
                <p className="text-sm text-gray-500">
                  Book is currently available from publisher
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Book Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  bucket="books"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gallery_images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gallery Images (Carousel)</FormLabel>
              <FormControl>
                <MultiImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  bucket="books"
                  maxImages={5}
                  label="Additional Images for Detail View"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : book ? 'Update Book' : 'Add Book'}
          </Button>
        </div>
      </form>
    </Form>
  );
}