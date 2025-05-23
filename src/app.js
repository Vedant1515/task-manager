const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const statusRouter = require('./routes/status');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api', statusRouter); // ✅ Add health check endpoint

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => console.error('🛑 MongoDB connection error:', error));
db.once('open', () => console.log('✅ MongoDB connected'));

// Start Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
