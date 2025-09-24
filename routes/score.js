const express = require('express');
const router = express.Router();
const scoring = require('../scoring');
const offerMod = require('./offer')._internal;
const leadsMod = require('./leads')._internal;
const { writeResultsToCSVBuffer } = require('../utils/csvUtils');

let lastResults = [];

router.post('/', async (req, res) => {
  const offer = offerMod.getOffer();
  if (!offer) return res.status(400).json({ error: 'No offer set. POST /offer first.' });

  const leads = leadsMod.getLeads();
  if (!leads || leads.length === 0) return res.status(400).json({ error: 'No leads uploaded. POST /leads/upload first.' });

  try {
    const results = await scoring.scoreLeads(leads, offer);
    lastResults = results;
    res.json({ message: 'Scoring completed', resultsCount: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scoring failed', details: err.message });
  }
});

router.get('/results', (req, res) => res.json(lastResults));

router.get('/results/export', (req, res) => {
  if (!lastResults || lastResults.length === 0) return res.status(404).json({ error: 'No results yet. POST /score first.' });
  const csvBuffer = writeResultsToCSVBuffer(lastResults);
  res.setHeader('Content-Disposition', 'attachment; filename="scored_leads.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csvBuffer);
});

module.exports = router;
