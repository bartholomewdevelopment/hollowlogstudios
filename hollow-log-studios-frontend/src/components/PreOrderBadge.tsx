import React from 'react';
import { Clock } from 'lucide-react';

interface PreOrderBadgeProps {
  className?: string;
}

/** Shown wherever a not-yet-released book appears, so the label reads the
 *  same on the storefront, in the cart, and at checkout. */
const PreOrderBadge: React.FC<PreOrderBadgeProps> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 ${className}`}
  >
    <Clock className="h-3 w-3" />
    Pre-Order
  </span>
);

export default PreOrderBadge;
