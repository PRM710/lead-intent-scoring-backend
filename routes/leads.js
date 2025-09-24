const express = require('express');
const multer = require('multer');
const { parseCSVBuffer } = require('../utils/csvUtils');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
let leadsStore = [];

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'CSV file required (form field: file)' });
    const leads = await parseCSVBuffer(req.file.buffer);
    leadsStore = leads;
    res.status(201).json({ message: `Uploaded ${leads.length} leads`, count: leads.length });
  } catch (err) {
    console.error('CSV parse error', err);
    res.status(500).json({ error: 'Failed to parse CSV' });
  }
});

router.get('/all', (req, res) => res.json(leadsStore));

module.exports = router;
module.exports._internal = { getLeads: () => leadsStore, setLeads: (arr) => (leadsStore = arr) };
