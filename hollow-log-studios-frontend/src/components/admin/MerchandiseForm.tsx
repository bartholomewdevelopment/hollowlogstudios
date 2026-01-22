import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Merchandise } from '@/types';
import { addMerchandise, updateMerchandise } from '@/firebase/merchandiseService';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { MultiImageUpload } from '@/components/admin/MultiImageUpload';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.string().optional(),
  in_stock: z.boolean().default(true),
  inventory_count: z.string().optional(),
  featured: z.boolean().default(false),
  primary_image: z.string().optional(),
  secondary_images: z.array(z.string()).optional(),
  available_sizes: z.array(z.string()).optional(),
  available_colors: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MerchandiseFormProps {
  merchandise?: Merchandise;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MerchandiseForm({ merchandise, onSuccess, onCancel }: MerchandiseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: merchandise?.title || '',
      description: merchandise?.description || '',
      price: merchandise?.price ? String(merchandise.price) : '',
      in_stock: merchandise?.in_stock ?? true,
      inventory_count: merchandise?.inventory_count ? String(merchandise.inventory_count) : '',
      featured: merchandise?.featured || false,
      primary_image: merchandise?.primary_image || '',
      secondary_images: merchandise?.secondary_images || [],
      available_sizes: (merchandise as any)?.available_sizes || [],
      available_colors: (merchandise as any)?.available_colors || [],
    },
  });

  const addSize = () => {
    if (sizeInput.trim()) {
      const currentSizes = form.getValues('available_sizes') || [];
      if (!currentSizes.includes(sizeInput.trim())) {
        form.setValue('available_sizes', [...currentSizes, sizeInput.trim()]);
      }
      setSizeInput('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    const currentSizes = form.getValues('available_sizes') || [];
    form.setValue('available_sizes', currentSizes.filter(size => size !== sizeToRemove));
  };

  const addColor = () => {
    if (colorInput.trim()) {
      const currentColors = form.getValues('available_colors') || [];
      if (!currentColors.includes(colorInput.trim())) {
        form.setValue('available_colors', [...currentColors, colorInput.trim()]);
      }
      setColorInput('');
    }
  };

  const removeColor = (colorToRemove: string) => {
    const currentColors = form.getValues('available_colors') || [];
    form.setValue('available_colors', currentColors.filter(color => color !== colorToRemove));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const merchandiseData = {
        title: data.title,
        description: data.description || null,
        price: data.price ? parseFloat(data.price) : null,
        in_stock: data.in_stock,
        inventory_count: data.inventory_count ? parseInt(data.inventory_count) : null,
        featured: data.featured,
        primary_image: data.primary_image || null,
        secondary_images: data.secondary_images?.filter(img => img) || [],
        available_sizes: data.available_sizes || [],
        available_colors: data.available_colors || [],
      };
      
      if (merchandise) {
        await updateMerchandise(merchandise.id, merchandiseData);
        toast({
          title: 'Merchandise updated',
          description: 'The merchandise item has been successfully updated.',
        });
      } else {
        await addMerchandise(merchandiseData);
        toast({
          title: 'Merchandise added',
          description: 'The merchandise item has been successfully added.',
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving merchandise:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the merchandise. Please try again.',
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
                <Input placeholder="Merchandise title" {...field} />
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
                <Textarea placeholder="Merchandise description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="available_sizes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Sizes (Optional)</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter size (e.g., S, M, L, XL)"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" onClick={addSize} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(field.value || []).map((size) => (
                    <Badge key={size} variant="secondary" className="flex items-center gap-1">
                      {size}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSize(size)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="available_colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Colors (Optional)</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter color (e.g., Red, Blue, Green)"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" onClick={addColor} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(field.value || []).map((color) => (
                    <Badge key={color} variant="outline" className="flex items-center gap-1">
                      {color}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeColor(color)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="primary_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  bucket="merchandise"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="secondary_images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Images</FormLabel>
              <FormControl>
                <MultiImageUpload
                  value={field.value || []}
                  onChange={field.onChange}
                  bucket="merchandise"
                  maxImages={4}
                  label="Additional Images"
                />
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
                <Input type="number" step="0.01" placeholder="19.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="in_stock"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>In Stock</FormLabel>
                <p className="text-sm text-gray-500">
                  Item is currently available for purchase
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inventory_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Count (Optional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} />
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
                <FormLabel>Featured Item</FormLabel>
                <p className="text-sm text-gray-500">
                  This item will be displayed prominently in the featured section
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : merchandise ? 'Update Merchandise' : 'Add Merchandise'}
          </Button>
        </div>
      </form>
    </Form>
  );
}