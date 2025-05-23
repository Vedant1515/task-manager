// src/routes/status.js (or wherever it's defined)
const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok' }); // ✅ Sends valid JSON response
});

module.exports = router;
