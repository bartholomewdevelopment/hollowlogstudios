import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommissionForm, { CommissionFormData } from '@/components/CommissionForm';
import SignupModal from '@/components/SignupModal';
import { createCommission } from '@/firebase/commissionService';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const CommissionsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [pendingCommission, setPendingCommission] = useState<CommissionFormData | null>(null);

  const handleSubmitCommission = async (data: CommissionFormData) => {
    try {
      setIsSubmitting(true);
      
      // Check if user is logged in
      if (!user) {
        // Store the commission data and show signup modal
        setPendingCommission(data);
        setShowSignupModal(true);
        return; // Stop here and wait for signup
      }
      
      // User is already logged in, proceed with commission
      await createCommission(data);
      setSubmissionSuccess(true);
      toast({
        title: "Success!",
        description: "Your commission request has been submitted successfully."
      });
    } catch (error) {
      console.error('Error submitting commission:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
      throw error; // Re-throw to let the form component handle the error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSuccess = async (userId: string) => {
    try {
      // Close the signup modal
      setShowSignupModal(false);
      
      if (pendingCommission) {
        // Now submit the commission with the new user ID
        await createCommission(pendingCommission);
        setPendingCommission(null);
        setSubmissionSuccess(true);
        toast({
          title: "Success!",
          description: "Your account was created and commission request submitted successfully."
        });
      }
    } catch (error) {
      console.error('Error submitting commission after signup:', error);
      toast({
        title: "Commission submission failed",
        description: "Your account was created but we couldn't submit your commission. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="py-8 bg-green-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Commission Your Artwork</h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Bethany specializes in custom children's book illustrations, fantasy portraits, and indoor/outdoor murals.
            Fill out the form below to start your custom art journey.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {submissionSuccess ? (
          <Card className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-green-600 mb-4">Thank You!</h2>
            <p className="text-center mb-4">
              Your commission request has been submitted successfully. We'll review your request and get back to you soon.
            </p>
            <div className="text-center">
              <button 
                onClick={() => setSubmissionSuccess(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <CommissionForm 
              onSubmit={handleSubmitCommission} 
              userEmail={userEmail}
              setUserEmail={setUserEmail}
            />
          </div>
        )}
      </div>
      
      {/* Signup Modal */}
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={handleSignupSuccess}
        email={userEmail}
      />
      
      <Footer />
    </div>
  );
};

export default CommissionsPage;
