import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ArtistProfile, getArtistProfile, updateArtistProfile } from '@/firebase/artistService';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  profile_image_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ArtistProfileForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      bio: '',
      profile_image_url: '',
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getArtistProfile();
        if (profileData) {
          setProfile(profileData);
          form.reset({
            name: profileData.name,
            bio: profileData.bio || '',
            profile_image_url: profileData.profile_image_url || '',
          });
        }
      } catch (error) {
        console.error('Error loading artist profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load artist profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [form, toast]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const updatedProfile = await updateArtistProfile({
        ...(profile ? { id: profile.id } : {}),
        ...data,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      toast({
        title: 'Success',
        description: 'Artist profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating artist profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update artist profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return <div className="p-4">Loading profile...</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist Bio</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Write your artist biography with rich formatting..."
                      className="min-h-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profile_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      bucket="artist_profile"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
