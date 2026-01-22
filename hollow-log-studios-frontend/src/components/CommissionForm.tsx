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
  email?: string;
  name?: string; // Added name field
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
    email: userEmail || '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Auto-fill user data when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : prev.name
      }));
      
      // Update parent email state if needed
      if (setUserEmail && user.email) {
        setUserEmail(user.email);
      }
    }
  }, [user, setUserEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update parent email state if this is the email field
    if (name === 'email' && setUserEmail) {
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

    // Validate email if not logged in
    if (!user && (!formData.email || !formData.email.includes('@'))) {
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
    <Card>
      <CardHeader>
        <CardTitle>Request a Commission</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
              className="min-h-[120px]"
              disabled={isSubmitting}
              required
            />
          </div>
          
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

          {!user && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
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
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CommissionForm;
