import { useEffect, useState } from 'react';
import { validateHotel, MAX_IMAGE_MB } from '../utils/validators.js';
import { imageUrl } from '../services/api.js';
import HotelMap from './HotelMap.jsx';

const FACILITIES = [
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

const ROOM_TYPES = [
  'Single Room',
  'Double Room',
  'Twin Room',
  'Deluxe Room',
  'Family Room',
  'Suite Room',
];

const EMPTY = {
  title: '',
  description: '',
  latitude: '',
  longitude: '',
  price: '',
  rating: '3',
  facilities: [],
  room_type: 'Double Room',
};

export default function HotelForm({
  initialValues,
  onSubmit,
  submitting,
  serverErrors = {},
  onCancel,
}) {
  const isEdit = Boolean(initialValues?.id);

  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');

  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        latitude: String(initialValues.latitude ?? ''),
        longitude: String(initialValues.longitude ?? ''),
        price: String(initialValues.price ?? ''),
        rating: String(initialValues.rating ?? 3),
        facilities: Array.isArray(initialValues.facilities)
          ? initialValues.facilities
          : [],
        room_type: initialValues.room_type ?? 'Double Room',
      });

      setPreview(imageUrl(initialValues.image_path));
    } else {
      setValues({ ...EMPTY, facilities: [] });
      setPreview('');
    }

    setFile(null);
    setTouched({});
    setSubmitted(false);
    setGeoMsg('');
  }, [initialValues]);

  useEffect(() => {
    if (!file) return undefined;

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clientErrors = validateHotel(values, {
    file,
    hasExistingImage: Boolean(initialValues?.image_path),
  });

  const errorOf = (name) =>
    ((touched[name] || submitted) && clientErrors[name]) ||
    serverErrors[name] ||
    '';

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleBlur = (event) => {
    setTouched((current) => ({
      ...current,
      [event.target.name]: true,
    }));
  };

  const handleFacilityChange = (facility) => {
    setValues((current) => ({
      ...current,
      facilities: current.facilities.includes(facility)
        ? current.facilities.filter((item) => item !== facility)
        : [...current.facilities, facility],
    }));

    setTouched((current) => ({
      ...current,
      facilities: true,
    }));
  };

  const handleFile = (event) => {
    setTouched((current) => ({
      ...current,
      image: true,
    }));

    setFile(event.target.files?.[0] || null);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoMsg('Geolocation is not supported by this browser');
      return;
    }

    setGeoMsg('Detecting location…');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValues((current) => ({
          ...current,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }));

        setGeoMsg('Location filled in');
      },
      () => {
        setGeoMsg(
          'Could not get your location. Please check location permission.'
        );
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(clientErrors).length > 0) return;

    const rating = Number(values.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return;
    }

    const fd = new FormData();

    fd.append('title', values.title.trim());
    fd.append('description', values.description.trim());
    fd.append('latitude', values.latitude);
    fd.append('longitude', values.longitude);
    fd.append('price', values.price);
    fd.append('rating', String(rating));
    fd.append('room_type', values.room_type);
    fd.append('facilities', JSON.stringify(values.facilities));

    if (file) {
      fd.append('image', file);
    }

    onSubmit(fd);
  };

  const Field = ({ name, label, children }) => (
    <div className={`field ${errorOf(name) ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}

      {errorOf(name) && (
        <span className="error" role="alert">
          {errorOf(name)}
        </span>
      )}
    </div>
  );

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {Field({
        name: 'image',
        label: `Hotel image${isEdit ? ' (leave empty to keep current)' : ''}`,
        children: (
          <>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFile}
            />

            <small className="hint">
              JPG, PNG, WEBP or GIF · max {MAX_IMAGE_MB} MB
            </small>

            {preview && (
              <img
                className="preview"
                src={preview}
                alt="Preview of the selected hotel"
              />
            )}
          </>
        ),
      })}

      {Field({
        name: 'title',
        label: 'Title',
        children: (
          <input
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Hotel name"
            maxLength={150}
          />
        ),
      })}

      {Field({
        name: 'description',
        label: 'Description',
        children: (
          <textarea
            id="description"
            name="description"
            rows={5}
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Describe the hotel…"
          />
        ),
      })}

      <div className="grid-2">
        {Field({
          name: 'latitude',
          label: 'Latitude',
          children: (
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={values.latitude}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0"
            />
          ),
        })}

        {Field({
          name: 'longitude',
          label: 'Longitude',
          children: (
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={values.longitude}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0"
            />
          ),
        })}
      </div>

      <div className="geo-row">
        <button
          type="button"
          className="btn btn-sm"
          onClick={useMyLocation}
        >
          📍 Use my current location
        </button>

        {geoMsg && <small className="hint">{geoMsg}</small>}
      </div>

      <div className="location-picker">
        <h3>Choose Hotel Location</h3>

        <HotelMap
          latitude={values.latitude}
          longitude={values.longitude}
          title={values.title}
          onLocationSelect={(latitude, longitude) => {
            setValues((current) => ({
              ...current,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
            }));
          }}
        />
      </div>

      {Field({
        name: 'price',
        label: 'Price per night (₹)',
        children: (
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0"
          />
        ),
      })}

      {}
      {Field({
        name: 'rating',
        label: 'Hotel Star Rating',
        children: (
          <div className="hotel-rating-options">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type="button"
                className={`hotel-rating-option ${
                  Number(values.rating) === star ? 'active' : ''
                }`}
                onClick={() => {
                  setValues((current) => ({
                    ...current,
                    rating: String(star),
                  }));

                  setTouched((current) => ({
                    ...current,
                    rating: true,
                  }));
                }}
                aria-pressed={Number(values.rating) === star}
              >
                <span
  style={{
    color: '#d4a017',
    fontSize: '22px',
    fontWeight: 'bold',
    display: 'inline-block',
    background: 'transparent',
    WebkitTextFillColor: '#d4a017',
  }}
>
  {'★'.repeat(star)}
</span>

                <span>
                  {star} {star === 1 ? 'Star' : 'Stars'}
                </span>
              </button>
            ))}
          </div>
        ),
      })}

      <div className={`field ${errorOf('room_type') ? 'has-error' : ''}`}>
        <label htmlFor="room_type">Room Type</label>

        <select
          id="room_type"
          name="room_type"
          value={values.room_type}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          {ROOM_TYPES.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>

        {errorOf('room_type') && (
          <span className="error" role="alert">
            {errorOf('room_type')}
          </span>
        )}
      </div>

      <div className={`field ${errorOf('facilities') ? 'has-error' : ''}`}>
        <label>Hotel Facilities</label>

        <small className="hint">
          Select all facilities available at this hotel.
        </small>

        <div className="facilities-grid">
          {FACILITIES.map((facility) => (
            <label className="facility-option" key={facility}>
              <input
                type="checkbox"
                checked={values.facilities.includes(facility)}
                onChange={() => handleFacilityChange(facility)}
              />
              <span>{facility}</span>
            </label>
          ))}
        </div>

        {errorOf('facilities') && (
          <span className="error" role="alert">
            {errorOf('facilities')}
          </span>
        )}
      </div>

      {serverErrors.form && (
        <div className="alert alert-error">
          {serverErrors.form}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting
            ? 'Saving…'
            : isEdit
              ? 'Update Hotel'
              : 'Add Hotel'}
        </button>
      </div>
    </form>
  );
}
