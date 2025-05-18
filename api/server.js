import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import imageDownloader from 'image-downloader';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Place from './models/Place.js';
import Booking from './models/Booking.js';

dotenv.config();
const app = express();
const jwtSecret = 'your_secret_key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

app.use((req, res, next) => {
  console.log(`📥 Incoming ${req.method} request to ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ✅ Configure multer storage to preserve file extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const photosMiddleware = multer({ storage });

app.post('/api/upload', photosMiddleware.array('photos', 100), (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.error('❌ No files received in the request.');
    return res.status(400).json({ error: 'No files uploaded.' });
  }
  const uploadedFiles = req.files.map(file => file.filename);
  console.log('📤 Uploaded Files:', uploadedFiles);
  res.json({ status: 'success', files: uploadedFiles });
});

app.post('/api/upload-by-link', async (req, res) => {
  try {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    const destPath = path.join(__dirname, 'uploads', newName);
    await imageDownloader.image({ url: link, dest: destPath });
    console.log('📤 Uploaded by link:', newName);
    res.json(newName);
  } catch (err) {
    console.error('❌ Upload by link failed:', err);
    res.status(500).json({ message: 'Failed to download image', error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({ name, email, password });
    res.status(201).json(userDoc);
  } catch (error) {
    res.status(422).json({ message: 'User registration failed', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email, password });
  if (userDoc) {
    const token = jwt.sign({ email: userDoc.email, id: userDoc._id, name: userDoc.name }, jwtSecret);
    res.cookie('token', token, { httpOnly: true }).json(userDoc);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
});

app.get('/api/profile', (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      const userDoc = await User.findById(userData.id);
      res.json(userDoc);
    });
  } else {
    res.json(null);
  }
});

// ⭐⭐⭐ PROFILE UPDATE ROUTE ⭐⭐⭐
app.put('/api/profile', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    const { name, email, password, currentPassword } = req.body;

    const user = await User.findById(userData.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If password update is requested, verify the old one
    if (password) {
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = password;
    }
    // Update name and email
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  });
});

app.get('/api/test-upload-check', (req, res) => {
  const testFilePath = path.join(__dirname, 'uploads', 'test.jpg');
  if (fs.existsSync(testFilePath)) {
    res.json({ status: 'success', message: 'test.jpg found in uploads' });
  } else {
    res.status(404).json({ status: 'error', message: 'test.jpg not found in uploads' });
  }
});

// ✅ Place Management Routes with Ownership
app.post('/api/places', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    try {
      const placeDoc = await Place.create({
        ...req.body,
        owner: userData.id
      });
      console.log('📥 New place saved with owner:', placeDoc);
      res.status(201).json(placeDoc);
    } catch (error) {
      console.error('❌ Error saving place:', error.message);
      res.status(500).json({ message: 'Error saving place', error: error.message });
    }
  });
});

app.put('/api/places', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const updatedPlace = await Place.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }
    console.log('📥 Place updated:', updatedPlace);
    res.json(updatedPlace);
  } catch (error) {
    console.error('❌ Error updating place:', error.message);
    res.status(500).json({ message: 'Error updating place', error: error.message });
  }
});

app.get('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }
    res.json(place);
  } catch (error) {
    console.error('❌ Error fetching place:', error.message);
    res.status(500).json({ message: 'Error fetching place', error: error.message });
  }
});

// ✅ Fetch User Places
app.get('/api/user-places', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    const userPlaces = await Place.find({ owner: userData.id });
    res.json(userPlaces);
  });
});

// ✅ Get all places (for explore or admin page)
app.get('/api/places', async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (error) {
    console.error('❌ Error fetching all places:', error.message);
    res.status(500).json({ message: 'Error fetching places', error: error.message });
  }
});

// ==============================
//         BOOKINGS ROUTES
// ==============================

// POST /api/bookings - create booking
app.post('/api/bookings', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    try {
      const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;
      const bookingDoc = await Booking.create({
        place,
        user: userData.id,
        checkIn,
        checkOut,
        numberOfGuests,
        name,
        phone,
        price,
      });
      res.status(201).json(bookingDoc);
    } catch (error) {
      console.error('❌ Error saving booking:', error.message);
      res.status(500).json({ message: 'Error saving booking', error: error.message });
    }
  });
});

// GET /api/bookings - fetch user bookings
app.get('/api/bookings', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    const bookings = await Booking.find({ user: userData.id }).populate('place');
    res.json(bookings);
  });
});

// GET /api/bookings/:id - fetch single booking
app.get('/api/bookings/:id', async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('place');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  });
});

app.listen(5002, () => {
  console.log('✅ Server running on port 5002');
});
