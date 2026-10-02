const express = require('express');
const axios = require('axios');
const path = require('path');
const { serverUrls, SECRET_TOKEN } = require('./server');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 🔒 Completely Locked & Hidden Route (Randomized Secret Path)
app.get('/api/v1/secure-node-fetch-9988', (req, res) => {
  const clientToken = req.headers['x-kamran-token'];
  const acceptHeader = req.headers['accept'] || '';

  if (acceptHeader.includes('text/html')) {
    return res.status(403.4).send('Access Denied');
  }

  if (clientToken !== SECRET_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized access blocked.' });
  }

  const servers = Object.keys(serverUrls).map(key => ({ 
    id: key, 
    name: `Server ${key.replace('server', '')}`, 
    url: serverUrls[key] 
  }));
  res.json({ servers });
});

app.get('/active', async (req, res) => {
  try {
    const { server } = req.query;
    if (!server || !serverUrls[server]) {
      return res.json({ error: 'Server not found' });
    }
    const response = await axios.get(`${serverUrls[server]}/active`, { timeout: 5000 });
    res.json({ count: response.data.count || 0, limit: response.data.limit || 50 });
  } catch (error) {
    res.json({ count: 0, limit: 50, error: 'Failed to fetch status' });
  }
});

app.get('/code', async (req, res) => {
  try {
    const { server, number } = req.query;
    if (!server || !number || !serverUrls[server]) {
      return res.json({ error: 'Server not found' });
    }
    const phoneNumber = number.replace(/[^\d]/g, '');
    const response = await axios.get(`${serverUrls[server]}/code?number=${phoneNumber}`, { timeout: 15000 });
    if (response.data && response.data.code) {
      res.json({ code: response.data.code });
    } else {
      res.json({ error: 'No code received' });
    }
  } catch (error) {
    res.json({ error: 'Failed to generate code' });
  }
});

// Explicit Clean Routes for HTML Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));
app.get('/support', (req, res) => res.sendFile(path.join(__dirname, 'support.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'services.html')));
app.get('/resources', (req, res) => res.sendFile(path.join(__dirname, 'resources.html')));
app.get('/video', (req, res) => res.sendFile(path.join(__dirname, 'video.html')));
app.get('/estimate', (req, res) => res.sendFile(path.join(__dirname, 'estimate.html')));
app.get('/giveaway', (req, res) => res.sendFile(path.join(__dirname, 'giveaway.html')));

// Fallback: if anyone types file name directly with .html
app.get('/:page', (req, res) => {
  const pageFile = path.join(__dirname, `${req.params.page}`);
  res.sendFile(pageFile, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
