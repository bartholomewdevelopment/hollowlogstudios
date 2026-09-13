import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createMural, updateMural } from '@/firebase/muralService';
import { ImageUpload } from './ImageUpload';
import { Mural } from '@/types';
import { toast } from '@/hooks/use-toast';

const muralSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  image_url: z.string().min(1, 'Image is required'),
  location: z.string().optional(),
  year: z.coerce.number().optional(),
  showcase: z.boolean().default(false),
});

type MuralFormValues = z.infer<typeof muralSchema>;

interface MuralFormProps {
  mural?: Mural;
  onSuccess?: () => void;
}

export default function MuralForm({ mural, onSuccess }: MuralFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!mural;

  const form = useForm<MuralFormValues>({
    resolver: zodResolver(muralSchema),
    defaultValues: {
      title: mural?.title || '',
      description: mural?.description || '',
      image_url: mural?.image_url || '',
      location: mural?.location || '',
      year: mural?.year || undefined,
      showcase: mural?.showcase || false,
    },
  });

  const handleImageUpload = (url: string) => {
    form.setValue('image_url', url);
  };

  const onSubmit = async (data: MuralFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && mural) {
        await updateMural(mural.id, data);
        toast({
          title: 'Success',
          description: 'Mural updated successfully',
        });
      } else {
        await createMural(data);
        form.reset({
          title: '',
          description: '',
          image_url: '',
          location: '',
          year: undefined,
          showcase: false,
        });
        toast({
          title: 'Success',
          description: 'Mural created successfully',
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving mural:', error);
      toast({
        title: 'Error',
        description: 'Failed to save mural. Please try again.',
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
                <Input placeholder="Enter mural title" {...field} />
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
                <Textarea 
                  placeholder="Enter mural description" 
                  className="min-h-32" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Where is this mural located?" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Year the mural was created" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mural Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <ImageUpload 
                    onUploadComplete={handleImageUpload} 
                    value={field.value}
                    onChange={field.onChange}
                    bucket="murals"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showcase"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Available for Showcase</FormLabel>
                <p className="text-sm text-gray-500">
                  List this mural in the Showcase tab so it can be added to the homepage carousel
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Mural' : 'Create Mural'}
        </Button>
      </form>
    </Form>
  );
}
