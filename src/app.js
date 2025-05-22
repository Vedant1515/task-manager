const express = require('express');
const mongoose = require('mongoose');
const app = express();
const taskRoutes = require('./routes/tasks');

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskdb')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));
}

app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use(express.static('frontend'));

module.exports = app;
