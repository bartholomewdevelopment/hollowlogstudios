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
import { AUTOGRAPH_SURCHARGE, autographedPrice } from '@/lib/bookPricing';

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
  autograph_available: z.boolean().default(true),
  pre_order: z.boolean().default(false),
  showcase: z.boolean().default(false),
  author: z.string().optional(),
  publisher: z.string().optional(),
  publication_year: z.string().optional(),
  role: z.string().optional(),
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
      autograph_available: book?.autograph_available ?? true,
      pre_order: book?.pre_order ?? false,
      showcase: book?.showcase ?? false,
      author: book?.author || '',
      publisher: book?.publisher || '',
      publication_year: book?.publication_year || '',
      role: book?.role || '',
    },
  });

  const priceValue = parseFloat(form.watch('price') || '');
  const autographedHint = Number.isFinite(priceValue)
    ? ` (currently $${autographedPrice(priceValue).toFixed(2)})`
    : '';

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
        autograph_available: data.autograph_available,
        pre_order: data.pre_order,
        showcase: data.showcase,
        author: data.author || null,
        publisher: data.publisher || null,
        publication_year: data.publication_year || null,
        role: data.role || null,
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
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Rebekah Eyre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publisher</FormLabel>
                <FormControl>
                  <Input placeholder="Sawdust Publishing" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publication_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input placeholder="2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Her Role</FormLabel>
                <FormControl>
                  <Input placeholder="Illustrator" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          name="showcase"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Available for Showcase</FormLabel>
                <p className="text-sm text-gray-500">
                  List this book in the Showcase tab so it can be added to the homepage carousel
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
          name="pre_order"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Pre-Order</FormLabel>
                <p className="text-sm text-gray-500">
                  Not released yet. Adds a "Pre-Order" badge on the website and
                  labels the item in the cart and at checkout.
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autograph_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!form.watch('website_cart_available')}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Autographed Copies Available</FormLabel>
                <p className="text-sm text-gray-500">
                  Offer a signed copy for ${AUTOGRAPH_SURCHARGE} more than the standard
                  price{autographedHint}. Uncheck this for books that cannot be signed.
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