require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const offerRoutes = require('./routes/offer');
const leadsRoutes = require('./routes/leads');
const scoreRoutes = require('./routes/score');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin: FRONTEND_ORIGIN }));

app.use('/offer', offerRoutes);
app.use('/leads', leadsRoutes);
app.use('/score', scoreRoutes);

// health
app.get('/', (req, res) => res.send({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));
