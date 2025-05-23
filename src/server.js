// server.js
const app = require('./app');
const PORT = process.env.PORT || 3002;
const client = require('prom-client'); // ✅ FIXED: Add missing import
client.collectDefaultMetrics();       // ✅ Optional: start collecting default metrics

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
