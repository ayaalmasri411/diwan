const express = require('express');
const { allowOffice } = require('../middleware/authorize');
const documents = require('../data/documents');

const router = express.Router();

router.post('/documents', allowOffice('entry'), (req, res) => {
  const doc = {
    id: Date.now().toString(),
    ...req.body,
    createdByOffice: 'entry',
    currentOffice: 'entry',
    status: 'needsProcessing'
  };

  documents.push(doc);
  res.json(doc);
});

module.exports = router;