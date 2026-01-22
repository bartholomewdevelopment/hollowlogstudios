import React, { useState, useEffect } from 'react';
import { Merchandise } from '@/types';
import { getMerchandise } from '@/firebase/merchandiseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';

export default function MerchandiseSection() {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { size?: string; color?: string }>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    const loadMerchandise = async () => {
      try {
        const data = await getMerchandise();
        console.log('Loaded merchandise:', data);
        setMerchandise(data.filter(item => item.in_stock));
      } catch (error) {
        console.error('Error loading merchandise:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMerchandise();
  }, []);

  const handleOptionChange = (itemId: string, optionType: 'size' | 'color', value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [optionType]: value
      }
    }));
  };

  const handleAddToCart = (item: Merchandise) => {
    const imageUrl = item.primary_image || 
                    (item.merchandise_images && item.merchandise_images.length > 0 
                      ? item.merchandise_images.find(img => img.is_main)?.image_url || item.merchandise_images[0]?.image_url
                      : null) || 
                    '/placeholder.svg';
    
    const selectedSize = selectedOptions[item.id]?.size;
    const selectedColor = selectedOptions[item.id]?.color;
    
    // Check if size/color selection is required but not provided
    const hasSizes = item.available_sizes && item.available_sizes.length > 0;
    const hasColors = item.available_colors && item.available_colors.length > 0;
    
    if (hasSizes && !selectedSize) {
      alert('Please select a size');
      return;
    }
    
    if (hasColors && !selectedColor) {
      alert('Please select a color');
      return;
    }
    
    addToCart({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      image_url: imageUrl,
      type: 'merchandise',
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    });
  };

  if (loading) return <div className="text-center py-8">Loading merchandise...</div>;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="griffy-text text-3xl font-bold mb-4">Merchandise</h2>
          <p className="text-lg text-gray-600 mb-8">
            Unique items featuring Bethany's artwork
          </p>
          
          
          {/* Printful Store Showcase */}
          <div className="relative mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">
              {/* Merchandise Collage */}
              <div className="aspect-[3/1] bg-gray-100 overflow-hidden">
                <img 
                  src="https://d64gsuwffb70l.cloudfront.net/6825378e65c820488ff6350b_1754258103795_48ee3ed6.png" 
                  alt="Merchandise Collection featuring Mothman artwork on various products"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Call to action */}
              <div className="p-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center">
                <h3 className="text-2xl font-bold mb-3">Shop Official Merchandise</h3>
                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                  Discover our full collection of premium merchandise featuring Bethany's enchanting artwork. 
                  From cozy mugs to beautiful prints, each item is crafted with care and ships directly to you!
                </p>
                <a 
                  href="https://hollowlogstudios.printful.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-green-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Visit Our Printful Store
                </a>

              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchandise.map((item) => {
            const imageUrl = item.primary_image || 
                            (item.merchandise_images && item.merchandise_images.length > 0 
                              ? item.merchandise_images.find(img => img.is_main)?.image_url || item.merchandise_images[0]?.image_url
                              : null) || 
                            '/placeholder.svg';
            
            const hasSizes = item.available_sizes && item.available_sizes.length > 0;
            const hasColors = item.available_colors && item.available_colors.length > 0;
            
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', imageUrl);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    {item.featured && <Badge>Featured</Badge>}
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </CardHeader>
                <CardContent>
                  {/* Size Selection */}
                  {hasSizes && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size *
                      </label>
                      <Select 
                        value={selectedOptions[item.id]?.size || ''} 
                        onValueChange={(value) => handleOptionChange(item.id, 'size', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {item.available_sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Color Selection */}
                  {hasColors && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color *
                      </label>
                      <Select 
                        value={selectedOptions[item.id]?.color || ''} 
                        onValueChange={(value) => handleOptionChange(item.id, 'color', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {item.available_colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      ${item.price ? item.price.toFixed(2) : 'N/A'}
                    </span>
                    {item.price && (
                      <Button onClick={() => handleAddToCart(item)}>
                        Add to Cart
                      </Button>
                    )}
                  </div>
                  {item.inventory_count && (
                    <p className="text-sm text-gray-500 mt-2">
                      {item.inventory_count} in stock
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}