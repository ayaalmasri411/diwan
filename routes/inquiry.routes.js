const express = require('express');
const router = express.Router();
const documents = require('../data/documents');

router.get('/search', (req, res) => {
  const { id } = req.query;
  const doc = documents.find(d => d.id === id);
  res.json(doc || null);
});

module.exports = router;