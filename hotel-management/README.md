# Hotel Management – Hotel List Page (CRUD + Responsive UI)

Full-stack project for the Namlatech task.

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Redux Toolkit, React Router (SPA), React Helmet (react-helmet-async), Leaflet/OpenStreetMap, plain HTML/CSS, Vite |
| Backend  | Node.js, Express, Multer (image upload), `pg` driver with **native SQL (no ORM)** |
| Database | PostgreSQL |

```
hotel-management/
├── database/                 <- SQL scripts (with comments)
│   ├── create_db.sql         1) creates the hotel_db database
│   ├── schema.sql            2) creates table, indexes, trigger, column comments
│   └── seed.sql              3) (optional) 8 sample hotels
├── backend/                  <- Node.js + Express API (port 5000)
│   ├── src/
│   │   ├── config/db.js              PostgreSQL pool
│   │   ├── models/hotelModel.js      ALL native SQL queries
│   │   ├── controllers/hotelController.js
│   │   ├── routes/hotelRoutes.js
│   │   ├── middleware/               upload (multer), validateHotel, errorHandler
│   │   ├── utils/file.js             delete image files
│   │   ├── app.js / server.js
│   ├── scripts/initDb.js     npm run db:init / db:seed
│   ├── uploads/              uploaded images are stored here
│   └── .env(.example)
└── frontend/                 <- React + Redux app (port 5173)
    ├── src/
    │   ├── components/       HotelForm (add+edit), HotelCard, Pagination, HotelMap, Popup, ConfirmDialog...
    │   ├── pages/            HotelListPage, HotelFormPage, HotelDetailPage
    │   ├── redux/            store.js, hotelsSlice.js (thunks for every API call)
    │   ├── services/api.js   axios instance + image URL helper
    │   └── utils/            validators.js, format.js
    └── .env(.example)
```

---

## Step-by-step setup

### 0. Prerequisites
* Node.js 18+ (`node -v`)
* PostgreSQL 13+ (`psql --version`) and its `postgres` user password

### 1. Create the database
```bash
psql -U postgres -f database/create_db.sql
```
(or in pgAdmin: right-click Databases → Create → Database → name `hotel_db`)

### 2. Create the table
```bash
psql -U postgres -d hotel_db -f database/schema.sql
```
Optional sample data (gives you 2 pages of results immediately):
```bash
psql -U postgres -d hotel_db -f database/seed.sql
```
Check it: `psql -U postgres -d hotel_db -c "\d+ hotels"` – the column comments are shown there.

### 3. Start the backend
```bash
cd backend
npm install
# edit .env -> set DB_PASSWORD to YOUR postgres password
npm run dev
```
You should see `PostgreSQL connected` and `API running at http://localhost:5000`.
(Alternative to steps 2: `npm run db:init` / `npm run db:seed` run the same SQL files through Node.)

Quick check: open http://localhost:5000/api/hotels in the browser.

### 4. Start the frontend
Open a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### 5. Try the features
1. **Add** – “+ Add Hotel” → choose an image (preview appears), fill the fields → submit. Try wrong values to see validation.
2. **List** – cards show image, title, price and a short description. Resize the browser to see the responsive layout.
3. **Search / Filter** – type a title (debounced) or set Min/Max price → *Apply*.
4. **Pagination** – 6 hotels per page (`limit`); page number → `offset`.
5. **Edit** – same form component, pre-filled. Leaving the image empty keeps the old one.
6. **Delete** – confirm dialog → success popup; the image file is deleted from `backend/uploads`.
7. **Detail** – click a card → full details + map built from the saved latitude/longitude. SEO tags are set via React Helmet (view the `<head>` in dev tools).

---

## REST API

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Body / Query | Description |
|--------|----------|--------------|-------------|
| GET | `/hotels` | `search`, `minPrice`, `maxPrice`, `offset` (default 0), `limit` (default 6, max 50) | List with filters + pagination → `{ data, total, limit, offset }` |
| GET | `/hotels/:id` | – | Single hotel (detail page) |
| POST | `/hotels` | multipart: `image` (file, required), `title`, `description`, `latitude`, `longitude`, `price` | Create (validated) |
| PUT | `/hotels/:id` | same fields, `image` optional | Update; a new image replaces & deletes the old file |
| DELETE | `/hotels/:id` | optional `?deleteImage=false` | Delete row (+ image file by default) |

Validation errors return `400 { "message": "Validation failed", "errors": { "price": "..." } }`.

### Test with curl
```bash
# list, search, price filter, pagination
curl "http://localhost:5000/api/hotels?search=goa&minPrice=3000&maxPrice=8000&offset=0&limit=6"

# create
curl -X POST http://localhost:5000/api/hotels \
  -F "title=Test Hotel" -F "description=A nice test hotel with great views" \
  -F "latitude=13.0827" -F "longitude=80.2707" -F "price=3500" -F "image=@/path/to/photo.jpg"

# update
curl -X PUT http://localhost:5000/api/hotels/1 \
  -F "title=Renamed Hotel" -F "description=Updated description text here" \
  -F "latitude=13.05" -F "longitude=80.28" -F "price=4000"

# delete
curl -X DELETE http://localhost:5000/api/hotels/1
```

---

## How each requirement is covered

| Requirement | Where |
|-------------|-------|
| Add/Edit form with validation, image preview | `frontend/src/components/HotelForm.jsx`, `utils/validators.js` |
| One reusable form for add & edit | `HotelForm` (add: `initialValues=null`, edit: hotel object) used by `HotelFormPage` |
| Card list (not table), image/title/price/short description | `HotelCard.jsx` |
| Search by title + price range filter | `HotelListPage.jsx` + `hotelModel.findAll` (single SQL with optional params) |
| Pagination (offset/limit) | `Pagination.jsx`, `hotelsSlice.js` (page → offset) |
| Edit & Delete buttons, success popup | `HotelCard.jsx`, `ConfirmDialog.jsx`, `Popup.jsx` |
| Detail page + map from lat/lng | `HotelDetailPage.jsx`, `HotelMap.jsx` (Leaflet). The form also uses the browser **Geolocation API** ("Use my current location") |
| React Helmet meta tags, image `alt` tags | every page uses `<Helmet>`; every `<img>` has an `alt` |
| SPA + reusable components | React Router in `App.jsx`; Form, Card, Pagination, Map, Popup are reusable |
| Express + PostgreSQL, native SQL | `backend/src/models/hotelModel.js` (parameterised queries `$1, $2…`) |
| Images stored on Node server, path saved in DB | `middleware/upload.js` → `backend/uploads/`, DB column `image_path` |

## Key SQL (from `hotelModel.js`)
```sql
-- list: NULL parameter = filter not applied
SELECT * FROM hotels
WHERE ($1::text    IS NULL OR title ILIKE $1)
  AND ($2::numeric IS NULL OR price >= $2)
  AND ($3::numeric IS NULL OR price <= $3)
ORDER BY created_at DESC, id DESC
LIMIT $4 OFFSET $5;
```

## Troubleshooting
* **`password authentication failed`** – fix `DB_PASSWORD` in `backend/.env`.
* **`database "hotel_db" does not exist`** – run step 1.
* **`relation "hotels" does not exist`** – run step 2.
* **CORS error / images not loading** – make sure `CLIENT_URL` (backend) is `http://localhost:5173` and `VITE_API_URL` (frontend) is `http://localhost:5000`; restart both after editing `.env`.
* **Port already in use** – change `PORT` in `backend/.env` and `VITE_API_URL` in `frontend/.env`.
* **Map tiles blank** – the map needs internet access (OpenStreetMap tiles).

## Production build
```bash
cd frontend && npm run build      # outputs frontend/dist
cd backend  && npm start
```
