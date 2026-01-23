import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCartEmail } from '@/firebase/cartService';
import { Mail, Gift } from 'lucide-react';

interface EmailCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailSubmit?: (email: string) => void;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ open, onOpenChange, onEmailSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Save email to localStorage for future visits
      localStorage.setItem('customer_email', email);

      // Update the cart with the email
      const sessionId = localStorage.getItem('cart_session_id');
      if (sessionId) {
        await updateCartEmail(sessionId, email);
      }

      onEmailSubmit?.(email);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('email_capture_skipped', 'true');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Stay Updated!
          </DialogTitle>
          <DialogDescription>
            Enter your email to receive order updates and exclusive offers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
            <p className="font-medium">Why provide your email?</p>
            <ul className="mt-1 space-y-1 text-green-700">
              <li>• Get notified when your order ships</li>
              <li>• Receive exclusive discount codes</li>
              <li>• Be the first to see new artwork</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCapture;
