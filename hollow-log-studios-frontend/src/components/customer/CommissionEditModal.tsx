import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Commission } from '@/types/customer-portal';

interface CommissionEditModalProps {
  commission: Commission | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Commission>) => Promise<void>;
}

const CommissionEditModal: React.FC<CommissionEditModalProps> = ({
  commission,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState<Partial<Commission>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Initialize form data when commission changes
  useEffect(() => {
    if (commission) {
      setFormData({
        title: commission.title,
        description: commission.description,
        type: commission.type,
        size: commission.size,
        budget: commission.budget,
        deadline: commission.deadline,
        contact_name: commission.contact_name || '',
        contact_email: commission.contact_email
      });
      
      // Set date if deadline exists
      if (commission.deadline) {
        setDate(new Date(commission.deadline));
      } else {
        setDate(undefined);
      }
    }
  }, [commission]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, deadline: format(selectedDate, 'yyyy-MM-dd') }));
    } else {
      setFormData(prev => ({ ...prev, deadline: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commission) return;
    
    try {
      setIsSubmitting(true);
      await onUpdate(commission.id, formData);
      toast({
        title: "Commission updated",
        description: "Your commission request has been updated successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error updating commission:', error);
      toast({
        title: "Update failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Commission Request</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Commission title"
              value={formData.title || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Your Name</Label>
            <Input
              id="contact_name"
              name="contact_name"
              placeholder="Your name"
              value={formData.contact_name || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type of Artwork</Label>
            <Select 
              value={formData.type || ''} 
              onValueChange={(value) => handleSelectChange('type', value)}
              disabled={isSubmitting}
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what you'd like commissioned"
              value={formData.description || ''}
              onChange={handleChange}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size">Size/Dimensions</Label>
            <Input
              id="size"
              name="size"
              placeholder="e.g. 24x36 inches"
              value={formData.size || ''}
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
              value={formData.budget || ''}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deadline">Desired Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
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

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Commission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommissionEditModal;
