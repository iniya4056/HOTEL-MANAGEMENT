const Hotel = require('../models/hotelModel');
const { removeFile } = require('../utils/file');

const toImagePath = (file) =>
  file ? `/uploads/${file.filename}` : null;

const optionalNumber = (v) =>
  v === undefined || String(v).trim() === ''
    ? undefined
    : Number(v);

const normalizeFacilities = (value) => {
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
};

const getHotelData = (req) => {
  const data = { ...(req.hotelData || {}) };

  const facilitiesValue =
    data.facilities !== undefined
      ? data.facilities
      : req.body?.facilities;

  const roomTypeValue =
    data.room_type !== undefined
      ? data.room_type
      : data.roomType !== undefined
        ? data.roomType
        : req.body?.room_type ?? req.body?.roomType;

  data.facilities = normalizeFacilities(facilitiesValue);

  if (roomTypeValue !== undefined && roomTypeValue !== '') {
    data.room_type = String(roomTypeValue).trim();
  }

  return data;
};

const uploadedFiles = (req) =>
  Array.isArray(req.files) ? req.files : [];

const cleanupUploadedFiles = (req) => {
  uploadedFiles(req).forEach((file) => removeFile(file.filename));
};

const removeImagePaths = (paths = []) => {
  paths.forEach((imagePath) => {
    if (imagePath) removeFile(imagePath);
  });
};

exports.getHotels = async (req, res, next) => {
  try {
    const search = (req.query.search || '').toString().trim();
    const minPrice = optionalNumber(req.query.minPrice);
    const maxPrice = optionalNumber(req.query.maxPrice);

    const rawRating = req.query.rating;
    const rating =
      rawRating === undefined || String(rawRating).trim() === ''
        ? undefined
        : Number(rawRating);

    const rawFacilities = req.query.facilities;
    const facilities =
      rawFacilities === undefined
        ? undefined
        : normalizeFacilities(rawFacilities);

    const rawRoomType = req.query.roomType ?? req.query.room_type;
    const roomType =
      rawRoomType === undefined || String(rawRoomType).trim() === ''
        ? undefined
        : String(rawRoomType).trim();

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 6, 1),
      50
    );

    const offset = Math.max(
      parseInt(req.query.offset, 10) || 0,
      0
    );

    if (
      (minPrice !== undefined &&
        (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined &&
        (!Number.isFinite(maxPrice) || maxPrice < 0))
    ) {
      return res.status(400).json({
        message: 'minPrice and maxPrice must be valid non-negative numbers',
      });
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      return res.status(400).json({
        message: 'minPrice cannot be greater than maxPrice',
      });
    }

    if (
      rating !== undefined &&
      (!Number.isInteger(rating) || rating < 1 || rating > 5)
    ) {
      return res.status(400).json({
        message: 'rating must be an integer from 1 to 5',
      });
    }

    const { data, total } = await Hotel.findAll({
      search,
      minPrice,
      maxPrice,
      rating,
      facilities,
      roomType,
      limit,
      offset,
    });

    res.json({ data, total, limit, offset });
  } catch (err) {
    next(err);
  }
};

exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: 'Hotel not found',
      });
    }

    res.json({ data: hotel });
  } catch (err) {
    next(err);
  }
};

exports.createHotel = async (req, res, next) => {
  const files = uploadedFiles(req);

  try {
    const hotelData = getHotelData(req);

    const coverPath = toImagePath(files[0]);

    const hotel = await Hotel.create({
      ...hotelData,
      imagePath: coverPath,
    });

    const imagePaths = files.map(toImagePath);

    try {
      await Hotel.replaceHotelImages(hotel.id, imagePaths);
    } catch (err) {
      throw err;
    }

    const result = await Hotel.findById(hotel.id);

    res.status(201).json({
      message: 'Hotel created',
      data: result,
    });
  } catch (err) {
    
    if (err && !err.hotelCreated) {
      
    }

    next(err);
  }
};

exports.updateHotel = async (req, res, next) => {
  const files = uploadedFiles(req);

  try {
    const existing = await Hotel.findById(req.params.id);

    if (!existing) {
      cleanupUploadedFiles(req);

      return res.status(404).json({
        message: 'Hotel not found',
      });
    }

    const hotelData = getHotelData(req);

    const coverPath = files.length
      ? toImagePath(files[0])
      : existing.image_path;

    const hotel = await Hotel.update(req.params.id, {
      ...hotelData,
      imagePath: coverPath,
    });

    let oldGalleryPaths = [];

    if (files.length) {
      const result = await Hotel.replaceHotelImages(
        req.params.id,
        files.map(toImagePath)
      );

      oldGalleryPaths = result.oldImages;
    }
    if (files.length) {
      removeImagePaths(oldGalleryPaths);

      if (
        existing.image_path &&
        existing.image_path !== coverPath &&
        !oldGalleryPaths.includes(existing.image_path)
      ) {
        removeFile(existing.image_path);
      }
    }

    const updatedHotel = await Hotel.findById(req.params.id);

    res.json({
      message: 'Hotel updated',
      data: updatedHotel || hotel,
    });
  } catch (err) {
   
    next(err);
  }
};

exports.deleteHotel = async (req, res, next) => {
  try {
    const existing = await Hotel.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: 'Hotel not found',
      });
    }

    const galleryPaths = (existing.images || []).map(
      (image) => image.image_path
    );

    const deleted = await Hotel.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: 'Hotel not found',
      });
    }

    if (req.query.deleteImage !== 'false') {
      removeImagePaths(galleryPaths);

      if (
        deleted.image_path &&
        !galleryPaths.includes(deleted.image_path)
      ) {
        removeFile(deleted.image_path);
      }
    }

    res.json({
      message: 'Hotel deleted successfully',
      data: { id: deleted.id },
    });
  } catch (err) {
    next(err);
  }
};
