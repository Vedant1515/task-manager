const express = require('express');
const mongoose = require('mongoose');
const app = express();

const taskRoutes = require('./routes/tasks');
const statusRoutes = require('./routes/status'); // ✅ Correct route import

app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use('/api', statusRoutes); // ✅ Mount health check here
app.use(express.static('frontend'));

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27020/taskdb')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));
}

module.exports = app;
