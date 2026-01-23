import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface CommissionFormProps {
  onSubmit: (data: CommissionFormData) => Promise<void>;
  onCancel?: () => void;
  userEmail?: string;
  setUserEmail?: (email: string) => void;
}

export interface CommissionFormData {
  type: string;
  description: string;
  size: string;
  budget: string;
  deadline: string;
  contact_name: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  contact_address_line1: string;
  contact_address_line2?: string;
  contact_city: string;
  contact_state: string;
  contact_postal_code: string;
  contact_country: string;
  contact_preferred_method?: string;
  contact_best_time?: string;
}

const CommissionForm: React.FC<CommissionFormProps> = ({ 
  onSubmit, 
  onCancel,
  userEmail,
  setUserEmail 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CommissionFormData>({
    type: '',
    description: '',
    size: '',
    budget: '',
    deadline: '',
    contact_name: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_email: userEmail || '',
    contact_phone: '',
    contact_address_line1: '',
    contact_address_line2: '',
    contact_city: '',
    contact_state: '',
    contact_postal_code: '',
    contact_country: '',
    contact_preferred_method: '',
    contact_best_time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Auto-fill user data when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contact_email: user.email || prev.contact_email,
        contact_first_name: user.first_name || prev.contact_first_name,
        contact_last_name: user.last_name || prev.contact_last_name,
        contact_name: user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : prev.contact_name
      }));
      
      // Update parent email state if needed
      if (setUserEmail && user.email) {
        setUserEmail(user.email);
      }
    }
  }, [user, setUserEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'contact_first_name' || name === 'contact_last_name') {
        next.contact_name = `${next.contact_first_name} ${next.contact_last_name}`.trim();
      }
      return next;
    });
    
    // Update parent email state if this is the email field
    if (name === 'contact_email' && setUserEmail) {
      setUserEmail(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, deadline: format(selectedDate, 'yyyy-MM-dd') }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.description.trim() || !formData.type) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (
      !formData.contact_first_name.trim() ||
      !formData.contact_last_name.trim() ||
      !formData.contact_email.trim() ||
      !formData.contact_phone.trim() ||
      !formData.contact_address_line1.trim() ||
      !formData.contact_city.trim() ||
      !formData.contact_state.trim() ||
      !formData.contact_postal_code.trim() ||
      !formData.contact_country.trim()
    ) {
      toast({
        title: "Missing contact info",
        description: "Please complete the required contact and address fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    if (!formData.contact_email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast({
        title: "Commission request submitted",
        description: "We'll contact you soon about your request"
      });
    } catch (error) {
      console.error('Error submitting commission:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-green-100 shadow-[0_18px_45px_rgba(34,88,63,0.12)]">
      <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 via-emerald-50 to-lime-50">
        <CardTitle className="text-2xl text-green-900">Request a Commission</CardTitle>
        <p className="text-sm text-green-800">
          Tell us about your project and the best way to reach you. Fields marked * are required.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          <section className="rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-900">Contact</h3>
              <p className="text-xs text-green-700">How we should reach you about your commission.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_first_name">First Name *</Label>
                <Input
                  id="contact_first_name"
                  name="contact_first_name"
                  placeholder="First name"
                  value={formData.contact_first_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_last_name">Last Name *</Label>
                <Input
                  id="contact_last_name"
                  name="contact_last_name"
                  placeholder="Last name"
                  value={formData.contact_last_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email *</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone *</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_preferred_method">Preferred Contact Method</Label>
                <Select
                  value={formData.contact_preferred_method || ''}
                  onValueChange={(value) => handleSelectChange('contact_preferred_method', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="contact_preferred_method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_best_time">Best Time to Reach You</Label>
                <Input
                  id="contact_best_time"
                  name="contact_best_time"
                  placeholder="Weekdays after 5pm"
                  value={formData.contact_best_time || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-900">Address</h3>
              <p className="text-xs text-green-700">Helpful for murals, shipping, and contracts.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact_address_line1">Address Line 1 *</Label>
                <Input
                  id="contact_address_line1"
                  name="contact_address_line1"
                  placeholder="Street address"
                  value={formData.contact_address_line1}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact_address_line2">Address Line 2</Label>
                <Input
                  id="contact_address_line2"
                  name="contact_address_line2"
                  placeholder="Apartment, suite, etc."
                  value={formData.contact_address_line2 || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_city">City *</Label>
                <Input
                  id="contact_city"
                  name="contact_city"
                  placeholder="City"
                  value={formData.contact_city}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_state">State/Region *</Label>
                <Input
                  id="contact_state"
                  name="contact_state"
                  placeholder="State"
                  value={formData.contact_state}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_postal_code">Postal Code *</Label>
                <Input
                  id="contact_postal_code"
                  name="contact_postal_code"
                  placeholder="ZIP"
                  value={formData.contact_postal_code}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_country">Country *</Label>
                <Input
                  id="contact_country"
                  name="contact_country"
                  placeholder="Country"
                  value={formData.contact_country}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-900">Project Details</h3>
              <p className="text-xs text-green-700">Tell us about the artwork you have in mind.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type of Artwork *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="illustrated-book">Illustrated Children's Book</SelectItem>
                    <SelectItem value="indoor-mural">Indoor Mural</SelectItem>
                    <SelectItem value="outdoor-mural">Outdoor Mural</SelectItem>
                    <SelectItem value="watercolor-portrait">Watercolor Portrait</SelectItem>
                    <SelectItem value="watercolor-illustration">Watercolor Illustration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what you'd like commissioned"
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[140px]"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="size">Size/Dimensions</Label>
                  <Input
                    id="size"
                    name="size"
                    placeholder="e.g. 24x36 inches"
                    value={formData.size}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    name="budget"
                    placeholder="Your budget range"
                    value={formData.budget}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Desired Completion Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </section>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 border-t border-green-100 bg-green-50/70 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-green-700">
            We review requests within 2-3 business days.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-700 hover:bg-green-800"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CommissionForm;
