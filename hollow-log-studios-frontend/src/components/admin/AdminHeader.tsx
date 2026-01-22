import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/firebase/authService';
import { useToast } from '@/hooks/use-toast';
import { Home, LogOut } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/admin/login');
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const goToMainSite = () => {
    window.location.href = 'https://hollowlogstudios.com';
  };

  return (
    <div className="bg-white p-4 mb-6 rounded-lg shadow flex justify-between items-center">
      <h2 className="text-xl font-semibold">Admin Controls</h2>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={goToMainSite}
          className="flex items-center gap-2"
        >
          <Home size={16} />
          Back to Website
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
