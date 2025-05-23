const app = require('./app');
const statusRoutes = require('./routes/status'); // Import health route

// Mount it here in case app.js doesn't mount it
app.use('/api', statusRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
