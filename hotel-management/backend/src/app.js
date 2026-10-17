require('dotenv').config();
const express = require('express');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const { UPLOAD_DIR } = require('./utils/file');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', (req, res, next) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/hotels', hotelRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
