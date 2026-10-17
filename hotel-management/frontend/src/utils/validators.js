export const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

export function validateHotel(values, { file, hasExistingImage }) {
  const e = {};

  const title = (values.title || '').trim();
  if (title.length < 3 || title.length > 150) e.title = 'Title must be 3-150 characters';

  const description = (values.description || '').trim();
  if (description.length < 10 || description.length > 2000) e.description = 'Description must be 10-2000 characters';

  const lat = Number(values.latitude);
  if (isBlank(values.latitude) || Number.isNaN(lat) || lat < -90 || lat > 90) {
    e.latitude = 'Enter a latitude between -90 and 90';
  }

  const lng = Number(values.longitude);
  if (isBlank(values.longitude) || Number.isNaN(lng) || lng < -180 || lng > 180) {
    e.longitude = 'Enter a longitude between -180 and 180';
  }

  const price = Number(values.price);
  if (isBlank(values.price) || Number.isNaN(price) || price <= 0) e.price = 'Enter a price greater than 0';
  else if (price > 99999999.99) e.price = 'Price is too large';

  if (!file && !hasExistingImage) e.image = 'Please upload a hotel image';
  if (file) {
    if (!ALLOWED_TYPES.includes(file.type)) e.image = 'Only JPG, PNG, WEBP or GIF images are allowed';
    else if (file.size > MAX_IMAGE_MB * 1024 * 1024) e.image = `Image must be ${MAX_IMAGE_MB} MB or smaller`;
  }
  return e;
}
