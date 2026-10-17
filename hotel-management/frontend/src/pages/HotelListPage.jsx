import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import {
  fetchHotels,
  deleteHotel,
  setFilters,
  clearFilters,
  setPage,
} from '../redux/hotelsSlice.js';

import HotelCard from '../components/HotelCard.jsx';
import Pagination from '../components/Pagination.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Popup from '../components/Popup.jsx';

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

export default function HotelListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    items,
    total,
    loading,
    error,
    page,
    limit,
    filters,
  } = useSelector((state) => state.hotels);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [minInput, setMinInput] = useState(filters.minPrice);
  const [maxInput, setMaxInput] = useState(filters.maxPrice);
  const [priceError, setPriceError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [popup, setPopup] = useState(null);

  const closePopup = useCallback(() => setPopup(null), []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const hasFilters =
    Boolean(filters.search) ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.rating !== '' ||
    Boolean(filters.roomType) ||
    Boolean(filters.facilities?.length);

  useEffect(() => {
    if (location.state?.flash) {
      setPopup({
        message: location.state.flash,
        type: 'success',
      });

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch, page, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== filters.search) {
        dispatch(setFilters({ search: searchInput.trim() }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, dispatch]);

  const applyPrice = (event) => {
    event.preventDefault();

    const min = minInput === '' ? null : Number(minInput);
    const max = maxInput === '' ? null : Number(maxInput);

    if (
      (min !== null && (!Number.isFinite(min) || min < 0)) ||
      (max !== null && (!Number.isFinite(max) || max < 0))
    ) {
      setPriceError('Prices must be non-negative numbers');
      return;
    }

    if (min !== null && max !== null && min > max) {
      setPriceError('Min price cannot exceed max price');
      return;
    }

    setPriceError('');

    dispatch(
      setFilters({
        minPrice: minInput,
        maxPrice: maxInput,
      })
    );
  };

  const selectRating = (rating) => {
    dispatch(setFilters({ rating }));
  };

  const selectRoomType = (roomType) => {
    dispatch(setFilters({ roomType }));
  };

  const toggleFacility = (facility) => {
    const selected = filters.facilities || [];

    const updated = selected.includes(facility)
      ? selected.filter((item) => item !== facility)
      : [...selected, facility];

    dispatch(setFilters({ facilities: updated }));
  };

  const reset = () => {
    setSearchInput('');
    setMinInput('');
    setMaxInput('');
    setPriceError('');
    dispatch(clearFilters());
  };

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await dispatch(deleteHotel(toDelete.id)).unwrap();

      setPopup({
        message: `"${toDelete.title}" was deleted successfully`,
        type: 'success',
      });

      if (items.length === 1 && page > 1) {
        dispatch(setPage(page - 1));
      } else {
        dispatch(fetchHotels());
      }
    } catch (err) {
      setPopup({
        message: err?.message || 'Could not delete the hotel',
        type: 'error',
      });
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Hotels | Hotel Manager</title>
        <meta
          name="description"
          content="Browse and manage hotels. Filter by price, rating, room type and facilities."
        />
        <meta property="og:title" content="Hotels | Hotel Manager" />
      </Helmet>

      <div className="page-head">
        <h1>Hotels</h1>

        <Link to="/hotels/new" className="btn btn-primary">
          + Add Hotel
        </Link>
      </div>

      <div className="layout hotel-layout">
      
        {}
        <section className="results hotel-results">

          {}
          
<div className="panel hotel-search-panel">
  <input
    type="search"
    placeholder="Search hotels..."
    value={searchInput}
    onChange={(event) => setSearchInput(event.target.value)}
    aria-label="Search hotels by title"
  />

  <form className="top-price-filter" onSubmit={applyPrice}>
    <input
      type="number"
      min="0"
      placeholder="Min price"
      value={minInput}
      onChange={(event) => setMinInput(event.target.value)}
      aria-label="Minimum price"
    />

    <input
      type="number"
      min="0"
      placeholder="Max price"
      value={maxInput}
      onChange={(event) => setMaxInput(event.target.value)}
      aria-label="Maximum price"
    />

    <button type="submit" className="btn btn-primary">
      Apply Price
    </button>
  </form>

  
<select
  value={filters.rating || ''}
  onChange={(event) => selectRating(event.target.value)}
>
  <option value="">Ratings</option>
  <option value="5">⭐⭐⭐⭐⭐</option>
  <option value="4">⭐⭐⭐⭐</option>
  <option value="3">⭐⭐⭐</option>
  <option value="2">⭐⭐</option>
  <option value="1">⭐</option>
</select>


  {priceError && (
    <span className="error">{priceError}</span>
  )}
</div>


          {}
          <div className="results-head">
            <strong>
              {loading
                ? 'Loading…'
                : `${total} hotel${total === 1 ? '' : 's'} found`}
            </strong>
          </div>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="empty">
              <h3>No hotels found</h3>

              <p>
                {hasFilters
                  ? 'Try changing or clearing your filters.'
                  : 'Add your first hotel to get started.'}
              </p>
            </div>
          )}

          {}
          <div className={`list ${loading ? 'is-loading' : ''}`}>
            {items.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onDelete={setToDelete}
              />
            ))}
          </div>

          {}
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(nextPage) => {
              dispatch(setPage(nextPage));
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}
          />
        </section>
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete hotel?"
          message={`"${toDelete.title}" and its image will be permanently removed.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setToDelete(null)}
        />
      )}

      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={closePopup}
        />
      )}
    </>
  );
}
