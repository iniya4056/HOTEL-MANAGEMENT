const { query } = require('../config/db');

const COLUMNS =
  'id, title, description, latitude, longitude, price, rating, facilities, room_type, image_path, created_at, updated_at';

const ROOM_TYPES = [
  'Single Room',
  'Double Room',
  'Twin Room',
  'Deluxe Room',
  'Family Room',
  'Suite Room',
];

const format = (row) =>
  row && {
    ...row,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    price: Number(row.price),
    rating: Number(row.rating),
    facilities: Array.isArray(row.facilities)
      ? row.facilities
      : [],
    room_type: row.room_type || 'Double Room',
  };

const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

async function findAll({
  search,
  minPrice,
  maxPrice,
  rating,
  facilities,
  roomType,
  limit,
  offset,
}) {
  const searchPattern = search
    ? `%${escapeLike(search)}%`
    : null;

  const selectedFacilities =
    Array.isArray(facilities) && facilities.length > 0
      ? facilities
      : null;

  const filterParams = [
    searchPattern,
    minPrice ?? null,
    maxPrice ?? null,
    rating ?? null,
    selectedFacilities,
    roomType || null,
  ];

  const where = `
    WHERE ($1::text IS NULL OR title ILIKE $1)
      AND ($2::numeric IS NULL OR price >= $2)
      AND ($3::numeric IS NULL OR price <= $3)
      AND ($4::integer IS NULL OR rating = $4)
      AND ($5::text[] IS NULL OR facilities @> $5::text[])
      AND ($6::text IS NULL OR room_type = $6)
  `;

  const [rows, count] = await Promise.all([
    query(
      `SELECT ${COLUMNS}
       FROM hotels
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $7 OFFSET $8`,
      [...filterParams, limit, offset]
    ),
    query(
      `SELECT COUNT(*)::int AS total
       FROM hotels
       ${where}`,
      filterParams
    ),
  ]);

  return {
    data: rows.rows.map(format),
    total: count.rows[0].total,
  };
}

async function findImagesByHotelId(hotelId) {
  const { rows } = await query(
    `SELECT id, hotel_id, image_path, created_at
     FROM hotel_images
     WHERE hotel_id = $1
     ORDER BY id ASC`,
    [hotelId]
  );

  return rows;
}

async function findById(id) {
  const { rows } = await query(
    `SELECT ${COLUMNS}
     FROM hotels
     WHERE id = $1`,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  const hotel = format(rows[0]);
  hotel.images = await findImagesByHotelId(id);

  return hotel;
}

async function create({
  title,
  description,
  latitude,
  longitude,
  price,
  rating = 3,
  facilities = [],
  room_type = 'Double Room',
  imagePath,
}) {
  const { rows } = await query(
    `INSERT INTO hotels (
       title,
       description,
       latitude,
       longitude,
       price,
       rating,
       facilities,
       room_type,
       image_path
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${COLUMNS}`,
    [
      title,
      description,
      latitude,
      longitude,
      price,
      rating,
      facilities,
      room_type,
      imagePath,
    ]
  );

  return format(rows[0]);
}

async function update(
  id,
  {
    title,
    description,
    latitude,
    longitude,
    price,
    rating = 3,
    facilities = [],
    room_type = 'Double Room',
    imagePath,
  }
) {
  const { rows } = await query(
    `UPDATE hotels
     SET title = $1,
         description = $2,
         latitude = $3,
         longitude = $4,
         price = $5,
         rating = $6,
         facilities = $7,
         room_type = $8,
         image_path = $9
     WHERE id = $10
     RETURNING ${COLUMNS}`,
    [
      title,
      description,
      latitude,
      longitude,
      price,
      rating,
      facilities,
      room_type,
      imagePath,
      id,
    ]
  );

  if (!rows[0]) {
    return null;
  }

  const hotel = format(rows[0]);
  hotel.images = await findImagesByHotelId(id);

  return hotel;
}

async function replaceHotelImages(hotelId, imagePaths) {
  const { rows: oldImages } = await query(
    `SELECT id, image_path
     FROM hotel_images
     WHERE hotel_id = $1`,
    [hotelId]
  );

  await query(
    'DELETE FROM hotel_images WHERE hotel_id = $1',
    [hotelId]
  );

  for (const imagePath of imagePaths) {
    await query(
      `INSERT INTO hotel_images (hotel_id, image_path)
       VALUES ($1, $2)`,
      [hotelId, imagePath]
    );
  }

  const images = await findImagesByHotelId(hotelId);

  return {
    images,
    oldImages: oldImages.map((image) => image.image_path),
  };
}

async function remove(id) {
  const { rows } = await query(
    'DELETE FROM hotels WHERE id = $1 RETURNING id, image_path',
    [id]
  );

  return rows[0];
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findImagesByHotelId,
  replaceHotelImages,
  ROOM_TYPES,
};
