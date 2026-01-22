import React from 'react';
import CommissionForm from '@/components/CommissionForm';

const CommissionSection: React.FC = () => {
  const handleSubmit = async (data: any) => {
    // This is a placeholder for the actual submission logic
    console.log('Commission form data:', data);
    // In a real application, you would send this data to your backend
    return Promise.resolve();
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold griffy-text mb-4">Request a Commission</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Interested in a custom piece? Fill out the form below to start the conversation
            about bringing your vision to life.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <CommissionForm onSubmit={handleSubmit} />
        </div>
      </div>
    </section>
  );
};

export default CommissionSection;