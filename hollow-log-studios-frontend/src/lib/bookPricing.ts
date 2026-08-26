import { Book } from '@/types';

/** An autographed copy costs this much more than the standard price. */
export const AUTOGRAPH_SURCHARGE = 10;

/**
 * Whether the signed-copy option should be offered for this book.
 * Books saved before this flag existed default to offering it, which is how
 * the site behaved for every cart-enabled book previously.
 */
export function canAutograph(book: Book): boolean {
  return book.website_cart_available && (book.autograph_available ?? true);
}

/** Standard price plus the autograph surcharge, rounded to cents. */
export function autographedPrice(price: number): number {
  return Math.round((price + AUTOGRAPH_SURCHARGE) * 100) / 100;
}
