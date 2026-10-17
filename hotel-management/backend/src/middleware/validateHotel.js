const { removeFile } = require('../utils/file');

const isBlank = (v) =>
  v === undefined || v === null || String(v).trim() === '';

const ROOM_TYPES = [
  'Single Room',
  'Double Room',
  'Twin Room',
  'Deluxe Room',
  'Family Room',
  'Suite Room',
];

const ALLOWED_FACILITIES = [
  'Wi-Fi',
  'Swimming Pool',
  'Parking',
  'Restaurant',
  'Air Conditioning',
  'Room Service',
  'Gym',
  'Spa',
  'Breakfast',
  'Pet Friendly',
];

function parseFacilities(value) {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  let parsed = value;

  if (typeof parsed === 'string') {
    try {
      const json = JSON.parse(parsed);
      parsed = Array.isArray(json) ? json : [parsed];
    } catch {
      parsed = [parsed];
    }
  }

  if (!Array.isArray(parsed)) {
    parsed = [parsed];
  }

  return [
    ...new Set(
      parsed
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}

function validateHotel({ requireImage }) {
  return (req, res, next) => {
    const b = req.body || {};
    const errors = {};

    const title = isBlank(b.title) ? '' : String(b.title).trim();

    if (title.length < 3 || title.length > 150) {
      errors.title = 'Title must be 3-150 characters';
    }

    const description = isBlank(b.description)
      ? ''
      : String(b.description).trim();

    if (description.length < 10 || description.length > 2000) {
      errors.description = 'Description must be 10-2000 characters';
    }

    const latitude = Number(b.latitude);

    if (
      isBlank(b.latitude) ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      errors.latitude = 'Latitude must be a number between -90 and 90';
    }

    const longitude = Number(b.longitude);

    if (
      isBlank(b.longitude) ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      errors.longitude = 'Longitude must be a number between -180 and 180';
    }

    const price = Number(b.price);

    if (
      isBlank(b.price) ||
      !Number.isFinite(price) ||
      price <= 0 ||
      price > 99999999.99
    ) {
      errors.price = 'Price must be a number greater than 0';
    }

    const rating = isBlank(b.rating) ? 3 : Number(b.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      errors.rating = 'Rating must be an integer from 1 to 5';
    }

    const facilities = parseFacilities(b.facilities);

    if (facilities.length > ALLOWED_FACILITIES.length) {
      errors.facilities = 'Too many facilities selected';
    } else if (
      facilities.some(
        (facility) => !ALLOWED_FACILITIES.includes(facility)
      )
    ) {
      errors.facilities = 'One or more selected facilities are invalid';
    }

    const room_type = isBlank(b.room_type)
      ? 'Double Room'
      : String(b.room_type).trim();

    if (!ROOM_TYPES.includes(room_type)) {
      errors.room_type = 'Please select a valid room type';
    }

    const files = Array.isArray(req.files)
      ? req.files
      : req.file
        ? [req.file]
        : [];

    if (files.length > 6) {
      errors.images = 'Maximum 6 images are allowed';
    }

    if (requireImage && files.length === 0) {
      errors.images = 'At least one image is required';
    }

    if (Object.keys(errors).length) {
      files.forEach((file) => removeFile(file.filename));

      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    req.hotelData = {
      title,
      description,
      latitude,
      longitude,
      price,
      rating,
      facilities,
      room_type,
    };

    next();
  };
}

module.exports = validateHotel;
