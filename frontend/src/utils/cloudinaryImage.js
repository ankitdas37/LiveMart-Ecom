/**
 * cloudinaryImage.js
 * -------------------
 * Utility to auto-optimize Cloudinary image URLs.
 *
 * Adds f_auto (best format: WebP/AVIF) and q_auto (smart compression)
 * and optional width resizing. This can save 60-80% on image payload
 * without any visible quality loss.
 *
 * Usage:
 *   import { cloudinaryUrl } from '../utils/cloudinaryImage';
 *   <img src={cloudinaryUrl(product.images[0], 400)} />
 */

/**
 * Transforms a Cloudinary image URL to add performance params.
 * @param {string} url - Original image URL
 * @param {number} [width] - Target display width in px (optional)
 * @param {number} [quality] - Quality hint (default: 'auto')
 * @returns {string} Optimized URL (or original if not a Cloudinary URL)
 */
export function cloudinaryUrl(url, width, quality = 'auto') {
  if (!url || typeof url !== 'string') return url;

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // Build transformation string
  const transforms = [`f_auto`, `q_${quality}`, `c_limit`];
  if (width) transforms.push(`w_${width}`);

  // Insert transforms after /upload/ in the URL
  // e.g. https://res.cloudinary.com/demo/image/upload/v1/sample.jpg
  //   -> https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_400/v1/sample.jpg
  const uploadMarker = '/upload/';
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url; // malformed URL, return as-is

  const base = url.substring(0, idx + uploadMarker.length);
  const rest = url.substring(idx + uploadMarker.length);

  // Don't double-add transforms if already present
  if (rest.startsWith('f_') || rest.startsWith('q_') || rest.startsWith('w_')) {
    return url;
  }

  return `${base}${transforms.join(',')}/${rest}`;
}

/**
 * Returns a Cloudinary thumbnail URL (small, square-cropped).
 * Ideal for product cards, category icons, avatars.
 * @param {string} url - Original image URL
 * @param {number} [size=200] - Width and height of the thumbnail
 */
export function cloudinaryThumb(url, size = 200) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;

  const uploadMarker = '/upload/';
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;

  const base = url.substring(0, idx + uploadMarker.length);
  const rest = url.substring(idx + uploadMarker.length);

  if (rest.startsWith('f_') || rest.startsWith('q_') || rest.startsWith('w_')) {
    return url;
  }

  return `${base}f_auto,q_auto,w_${size},h_${size},c_fill/${rest}`;
}
