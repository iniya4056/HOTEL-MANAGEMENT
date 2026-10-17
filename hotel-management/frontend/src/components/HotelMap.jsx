import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const gpsIcon = L.divIcon({
  className: 'gps-location-icon',
  html: `
    <div style="
      width: 22px;
      height: 22px;
      background: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 5px rgba(0,0,0,0.45);
    "></div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});


export default function HotelMap({ latitude, longitude, title }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  const position = [
    Number.isFinite(lat) ? lat : 13.0827,
    Number.isFinite(lng) ? lng : 80.2707,
  ];

  return (
    <MapContainer
      key={position.join(',')}
      center={position}
      zoom={14}
      scrollWheelZoom={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position} icon={gpsIcon}>
        <Popup>{title || 'Selected location'}</Popup>
      </Marker>
    </MapContainer>
  );
}
