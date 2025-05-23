const express = require('express');
const client = require('prom-client');
const app = require('./app');

const PORT = process.env.PORT || 3002;

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
