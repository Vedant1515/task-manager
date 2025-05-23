// server.js
const app = require('./app');
const client = require('prom-client');
client.collectDefaultMetrics();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ✅ Important for Docker

// 🔥 Place all routes before listen
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
