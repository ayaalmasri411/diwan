const express = require('express');
const { allowOffice } = require('../middleware/authorize');

const router = express.Router();

router.get(
  '/stats',
  allowOffice('reports'),
  (req, res) => {
    res.json({ stats: [] });
  }
);

module.exports = router;