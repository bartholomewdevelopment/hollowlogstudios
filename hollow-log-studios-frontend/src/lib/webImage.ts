/**
 * Web-sized copies of artwork, written by the webImages Cloud Function
 * (functions/index.js). Originals can be 100 MB scans; these are ~1600px and
 * ~320px JPEGs that browsers cache.
 */
interface HasWebImages {
  image_url?: string | null;
  image_web_url?: string;
  image_thumb_url?: string;
  image_web_source?: string;
}

/** The copies only count if they were made from the current image — straight
 *  after an image is replaced, the function may not have caught up yet. */
const fresh = (d: HasWebImages) => !!d.image_url && d.image_web_source === d.image_url;

/** For anything shown large: the carousel, detail views, gallery cards. */
export const displayImage = (d: HasWebImages): string =>
  (fresh(d) && d.image_web_url) || d.image_url || '';

/** For small previews: filmstrips, admin lists. */
export const thumbImage = (d: HasWebImages): string =>
  (fresh(d) && d.image_thumb_url) || displayImage(d);
