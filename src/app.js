const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const mongoURI = 'mongodb+srv://admin:admin@twilight.efmw5.mongodb.net/';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});