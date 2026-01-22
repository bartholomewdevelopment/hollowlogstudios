import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  linkTo: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ title, description, icon, buttonText, linkTo }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
      <div className="text-[#238830] mb-4 text-3xl">{icon}</div>
      <h3 className="text-xl font-bold mb-2 griffy-text">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link to={linkTo}>
        <Button className="bg-[#238830] hover:bg-green-700 text-white">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

const ProductSection: React.FC = () => {
  return (
    <section className="pt-4 pb-12 bg-green-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 griffy-text">Magical Creations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProductCard
            title="Art Prints"
            description="High-quality prints of original watercolor paintings featuring magical scenes and diverse characters."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            buttonText="Shop Prints"
            linkTo="/gallery#artwork"
          />
          
          <ProductCard
            title="Children's Book Illustrations"
            description="Custom illustrations that bring your stories to life with whimsical characters and enchanted settings."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            buttonText="Commission Illustrations"
            linkTo="/commissions"
          />
          
          <ProductCard
            title="Custom Murals"
            description="Transform your space with breathtaking indoor or outdoor murals that create an immersive fantasy experience."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            buttonText="Request a Mural"
            linkTo="/commissions"
          />
        </div>
      </div>
    </section>
  );
};

export default ProductSection;