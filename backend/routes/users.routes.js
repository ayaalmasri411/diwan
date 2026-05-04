const express = require('express');
const router = express.Router();

router.get('/me', (req, res) => {
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

module.exports = router;