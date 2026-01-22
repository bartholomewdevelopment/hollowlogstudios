import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TagPriceInputProps {
  tag: string;
  price: number | undefined;
  onChange: (tag: string, price: number | undefined) => void;
}

export function TagPriceInput({ tag, price, onChange }: TagPriceInputProps) {
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onChange(tag, undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onChange(tag, numValue);
      }
    }
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={`price-${tag}`}>{tag} Price</Label>
      <Input
        id={`price-${tag}`}
        type="number"
        step="0.01"
        min="0"
        value={price !== undefined ? price : ''}
        onChange={handlePriceChange}
        placeholder="0.00"
        className="w-full"
      />
    </div>
  );
}
