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

// ✅ Allowed origins (production + local)
const allowedOrigins = [
  'https://lead-intent-scoring-frontend.vercel.app',
  'http://localhost:3000',  // React dev server
  'http://localhost:5173'   // Vite dev server
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Routes
app.use('/offer', offerRoutes);
app.use('/leads', leadsRoutes);
app.use('/score', scoreRoutes);

// Health check
app.get('/', (req, res) => res.send({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Backend running at http://localhost:${port}`));
