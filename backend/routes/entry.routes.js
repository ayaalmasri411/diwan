const express = require('express');
const { allowOffice } = require('../middleware/authorize');

const router = express.Router();

router.post(
  '/documents',
  allowOffice('entry'),
  (req, res) => {
    res.json({ message: 'تم إنشاء المعاملة' });
  }
);

module.exports = router;