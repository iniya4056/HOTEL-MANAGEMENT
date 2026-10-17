const express = require('express');
const upload = require('../middleware/upload');
const validateHotel = require('../middleware/validateHotel');
const c = require('../controllers/hotelController');

const router = express.Router();

router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(400).json({ message: 'Invalid hotel id' });
  next();
});

router.get('/', c.getHotels);                                                                      
router.get('/:id', c.getHotel);                                                                    
router.post('/', upload.single('image'), validateHotel({ requireImage: true }), c.createHotel);   
router.put('/:id', upload.single('image'), validateHotel({ requireImage: false }), c.updateHotel); 
router.delete('/:id', c.deleteHotel);                                                            

module.exports = router;
