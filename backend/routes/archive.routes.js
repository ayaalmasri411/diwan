const express = require('express');
const { allowOffice } = require('../middleware/authorize');

const router = express.Router();

router.post(
  '/upload',
  allowOffice('archive'),
  (req, res) => {
    res.json({ message: 'تمت الأرشفة بنجاح' });
  }
);

module.exports = router;