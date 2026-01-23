import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const EMAIL_STORAGE_KEY = 'magic_link_email';

const AccountLoginPage: React.FC = () => {
  const { sendMagicLink, signInWithMagicLink, isMagicLink } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem(EMAIL_STORAGE_KEY) || '');
  const [sending, setSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [processingLink, setProcessingLink] = useState(false);
  const [needsEmail, setNeedsEmail] = useState(false);

  useEffect(() => {
    const link = window.location.href;
    if (!isMagicLink(link)) return;

    const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!storedEmail) {
      setNeedsEmail(true);
      return;
    }

    const completeSignIn = async () => {
      try {
        setProcessingLink(true);
        await signInWithMagicLink(storedEmail, link);
        localStorage.removeItem(EMAIL_STORAGE_KEY);
        navigate('/account', { replace: true });
      } catch (error: any) {
        toast({
          title: 'Sign-in failed',
          description: error?.message || 'Please request a new sign-in link.',
          variant: 'destructive',
        });
      } finally {
        setProcessingLink(false);
      }
    };

    completeSignIn();
  }, [isMagicLink, navigate, signInWithMagicLink, toast]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSending(true);
      const redirectUrl = `${window.location.origin}/account/login`;
      await sendMagicLink(email.trim(), redirectUrl);
      localStorage.setItem(EMAIL_STORAGE_KEY, email.trim());
      setLinkSent(true);
      toast({
        title: 'Check your email',
        description: 'We sent a secure sign-in link to your inbox.',
      });
    } catch (error: any) {
      toast({
        title: 'Could not send link',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleCompleteLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const link = window.location.href;
    if (!email.trim() || !isMagicLink(link)) return;

    try {
      setProcessingLink(true);
      await signInWithMagicLink(email.trim(), link);
      localStorage.removeItem(EMAIL_STORAGE_KEY);
      navigate('/account', { replace: true });
    } catch (error: any) {
      toast({
        title: 'Sign-in failed',
        description: error?.message || 'Please request a new sign-in link.',
        variant: 'destructive',
      });
    } finally {
      setProcessingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-lg">
          <Card className="border-green-100 shadow-[0_18px_45px_rgba(34,88,63,0.12)]">
            <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 via-emerald-50 to-lime-50">
              <CardTitle className="text-2xl text-green-900">Customer Portal</CardTitle>
              <p className="text-sm text-green-800">
                Sign in with a secure link sent to your email.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {processingLink ? (
                <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
                  Signing you in...
                </div>
              ) : needsEmail ? (
                <form onSubmit={handleCompleteLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Confirm your email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
                    Finish Sign-in
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSendLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={sending}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    {sending ? 'Sending link...' : 'Email me a sign-in link'}
                  </Button>
                  {linkSent && (
                    <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-900">
                      Link sent. Check your email and click the sign-in link to access your account.
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountLoginPage;
