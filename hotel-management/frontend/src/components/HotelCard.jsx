import { useNavigate } from 'react-router-dom';
import { imageUrl } from '../services/api.js';
import { formatPrice, truncate } from '../utils/format.js';

export default function HotelCard({ hotel, onDelete }) {
  const navigate = useNavigate();

  const open = () => navigate(`/hotels/${hotel.id}`);

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  const rating = Math.min(5, Math.max(0, Number(hotel.rating) || 0));

  return (
    <article
      className="card"
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      tabIndex={0}
      role="link"
      aria-label={`View details of ${hotel.title}`}
    >
      <img
        className="card-img"
        src={imageUrl(hotel.image_path)}
        alt={`${hotel.title} hotel`}
        loading="lazy"
      />

      <div className="card-body">
        <h3 className="card-title">{hotel.title}</h3>

        <div
          className="hotel-stars"
          aria-label={`${rating} stars`}
          title={`${rating} stars`}
        >
          {'★'.repeat(rating)}
          {'☆'.repeat(5 - rating)}
        </div>

        <p className="card-desc">
          {truncate(hotel.description, 130)}
        </p>
      </div>

      <div className="card-side">
        <div className="price">
          {formatPrice(hotel.price)}
          <small> / night</small>
        </div>

        <div className="card-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={stop(() => navigate(`/hotels/${hotel.id}/edit`))}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={stop(() => onDelete(hotel))}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
