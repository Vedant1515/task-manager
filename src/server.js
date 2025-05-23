const express = require('express');
const client = require('prom-client');
const app = require('./app');
const statusRoutes = require('./routes/status'); // 🆕 ensure this is here

const PORT = process.env.PORT || 3002;

// Mount health route directly to support health check
app.use('/api', statusRoutes);

// Optional: Prometheus metrics if you're using Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
