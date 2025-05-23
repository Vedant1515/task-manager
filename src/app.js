// app.js
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/tasks');
const statusRoutes = require('./routes/status'); // ✅

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use('/api', statusRoutes); // ✅ this mounts `/api/status`

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/taskdb')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));
}

module.exports = app;
