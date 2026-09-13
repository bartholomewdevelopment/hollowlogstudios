/**
 * iPhone photos arrive as HEIC, which only Safari can display. Anything we
 * store has to show on every browser, so HEIC is converted to JPEG before it
 * is uploaded.
 */

/** File extensions to list in an <input accept> alongside image/*. */
export const HEIC_ACCEPT = '.heic,.heif,image/heic,image/heif';

/** Many browsers report an empty type for HEIC, so the extension is checked too. */
export function looksLikeHeic(file: File): boolean {
  return /^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  if (!looksLikeHeic(file)) return file;

  // The converter is ~3 MB, so it is only fetched when a HEIC is picked.
  const { heicTo } = await import('heic-to');
  try {
    const jpeg = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 });
    const name = file.name.replace(/\.hei[cf]$/i, '') + '.jpg';
    return new File([jpeg], name, { type: 'image/jpeg', lastModified: file.lastModified });
  } catch (error) {
    console.error('Error converting HEIC image:', error);
    throw new Error('Could not convert this iPhone photo (HEIC). Try exporting it as JPEG first.');
  }
}
