const express = require('express');
const router = express.Router();

let currentOffer = null;

router.post('/', (req, res) => {
  const { name, value_props, ideal_use_cases } = req.body;
  if (!name || !ideal_use_cases) return res.status(400).json({ error: 'Missing name or ideal_use_cases' });
  currentOffer = { name, value_props: value_props || [], ideal_use_cases };
  res.status(201).json({ message: 'Offer saved', offer: currentOffer });
});

router.get('/', (req, res) => {
  if (!currentOffer) return res.status(404).json({ error: 'No offer saved' });
  res.json(currentOffer);
});

module.exports = router;
module.exports._internal = { getOffer: () => currentOffer, setOffer: (o) => (currentOffer = o) };
