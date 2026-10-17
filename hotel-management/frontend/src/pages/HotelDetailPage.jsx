import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchHotelById, deleteHotel, clearCurrent } from '../redux/hotelsSlice.js';
import HotelMap from '../components/HotelMap.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Popup from '../components/Popup.jsx';
import { imageUrl } from '../services/api.js';
import { formatPrice, truncate } from '../utils/format.js';

export default function HotelDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: hotel, detailLoading, detailError } = useSelector((s) => s.hotels);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [popup, setPopup] = useState(null);
  const closePopup = useCallback(() => setPopup(null), []);

  useEffect(() => {
    dispatch(fetchHotelById(id));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteHotel(hotel.id)).unwrap();
      navigate('/', { state: { flash: `"${hotel.title}" was deleted successfully` } });
    } catch (err) {
      setPopup({ message: err?.message || 'Could not delete the hotel', type: 'error' });
      setDeleting(false);
      setConfirm(false);
    }
  };

  if (detailLoading || (!hotel && !detailError)) return <p>Loading hotel…</p>;
  if (detailError) {
    return (
      <div className="empty">
        <h2>{detailError}</h2>
        <Link to="/" className="btn btn-primary">Back to hotels</Link>
      </div>
    );
  }

  return (
    <article className="detail">
      {}
      <Helmet>
        <title>{`${hotel.title} | Hotel Manager`}</title>
        <meta name="description" content={truncate(hotel.description, 155)} />
        <meta property="og:title" content={hotel.title} />
        <meta property="og:description" content={truncate(hotel.description, 155)} />
        <meta property="og:image" content={imageUrl(hotel.image_path)} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Link to="/" className="back">← Back to hotels</Link>

      <div className="detail-grid">
        <img className="detail-img" src={imageUrl(hotel.image_path)} alt={`${hotel.title} hotel`} />
        <div>
          <h1>{hotel.title}</h1>
          <div className="price price-lg">{formatPrice(hotel.price)}<small> / night</small></div>
          <p className="detail-desc">{hotel.description}</p>
          <dl className="meta">
            <dt>Latitude</dt><dd>{hotel.latitude}</dd>
            <dt>Longitude</dt><dd>{hotel.longitude}</dd>
            <dt>Added</dt><dd>{new Date(hotel.created_at).toLocaleDateString()}</dd>
          </dl>
          <div className="card-actions">
            <Link to={`/hotels/${hotel.id}/edit`} className="btn btn-primary">Edit</Link>
            <button className="btn btn-danger" onClick={() => setConfirm(true)}>Delete</button>
          </div>

          
{}
<div className="hotel-detail-rating">
  <span className="stars">
    {'★'.repeat(Number(hotel.rating) || 0)}
  </span>
  <span>{hotel.rating || 0} / 5</span>
</div>

{}
<div className="hotel-detail-info">
  <h3>🛏️ Room Type</h3>
  <p>{hotel.room_type || 'Double Room'}</p>
</div>

{}
<div className="hotel-detail-info">
  <h3>✨ Facilities</h3>

  {Array.isArray(hotel.facilities) &&
  hotel.facilities.length > 0 ? (
    <div className="hotel-facilities-list">
      {hotel.facilities.map((facility) => (
        <span key={facility} className="hotel-facility">
          ✓ {facility}
        </span>
      ))}
    </div>
  ) : (
    <p>No facilities listed.</p>
  )}
</div>

        </div>
      </div>

      <h2>Location</h2>
      <HotelMap latitude={hotel.latitude} longitude={hotel.longitude} title={hotel.title} />

      {confirm && (
        <ConfirmDialog
          title="Delete hotel?"
          message={`"${hotel.title}" and its image will be permanently removed.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setConfirm(false)}
        />
      )}
      {popup && <Popup message={popup.message} type={popup.type} onClose={closePopup} />}
    </article>
  );
}
