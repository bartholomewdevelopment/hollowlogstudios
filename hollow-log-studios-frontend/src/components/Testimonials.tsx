import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getAllTestimonials } from '@/firebase/testimonialService';
import { Testimonial } from '@/types';

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTestimonials()
      .then(setTestimonials)
      .catch(err => console.error('Failed to load testimonials:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold griffy-text mb-2">What Collectors Are Saying</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real words from real people who brought a piece of Hollow Log Studios home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-green-100 flex flex-col"
            >
              <Stars count={t.stars} />
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-green-50">
                <span className="font-semibold text-gray-800 text-sm">{t.name}</span>
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  {t.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
