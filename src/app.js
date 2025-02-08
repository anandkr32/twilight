const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

// MongoDB connection
const mongoURI = 'mongodb+srv://instae93:ZPJ3lKdrS6hk80yA@instaems.r0jnl.mongodb.net/';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});