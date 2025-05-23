// src/server.js
const app = require('./app');
const statusRoutes = require('./routes/status'); // ✅ Import health route

const PORT = process.env.PORT || 3002;

// ✅ Mount health route if not already mounted in app.js
app.use('/api', statusRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

