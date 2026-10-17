import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { createHotel, updateHotel, fetchHotelById, clearCurrent } from '../redux/hotelsSlice.js';
import HotelForm from '../components/HotelForm.jsx';

export default function HotelFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, detailLoading, detailError, saving, saveError } = useSelector((s) => s.hotels);

  useEffect(() => {
    if (isEdit) dispatch(fetchHotelById(id));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) await dispatch(updateHotel({ id, formData })).unwrap();
      else await dispatch(createHotel(formData)).unwrap();
      navigate('/', { state: { flash: isEdit ? 'Hotel updated successfully' : 'Hotel added successfully' } });
    } catch {
    }
  };

  const serverErrors = { ...(saveError?.errors || {}) };
  if (saveError && !Object.keys(serverErrors).length) serverErrors.form = saveError.message;

  const title = isEdit ? 'Edit Hotel' : 'Add Hotel';
  const ready = !isEdit || (current && String(current.id) === String(id));

  return (
    <div className="form-page">
      <Helmet>
        <title>{`${title} | Hotel Manager`}</title>
        <meta name="description" content={isEdit ? 'Update hotel details' : 'Add a new hotel to the list'} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1>{title}</h1>

      {isEdit && detailLoading && <p>Loading hotel…</p>}
      {isEdit && detailError && <div className="alert alert-error">{detailError}</div>}

      {ready && !detailError && (
        <HotelForm
          initialValues={isEdit ? current : null}
          onSubmit={handleSubmit}
          submitting={saving}
          serverErrors={serverErrors}
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  );
}
