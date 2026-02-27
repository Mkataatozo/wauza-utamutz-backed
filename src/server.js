// server.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Wauza Utamutz Backend Running 🚀');
});

// API route
app.get('/api', (req, res) => {
  res.json({ message: 'API working 🚀' });
});

// Example: another API endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is live 🌍' });
});

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});