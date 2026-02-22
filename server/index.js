const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const HA_URL = (process.env.HA_URL || 'http://homeassistant.local:8123').replace(/\/$/, '');
const HA_ENTITY_ID = process.env.HA_ENTITY_ID || 'switch.smart_plug';
const HA_TOKEN = process.env.HA_TOKEN || '';
const PLUG_NAME = process.env.PLUG_NAME || 'Smart Plug';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (HA_TOKEN) {
      headers['Authorization'] = `Bearer ${HA_TOKEN}`;
    }

    const response = await fetch(`${HA_URL}/api/states/${HA_ENTITY_ID}`, {
      headers,
      timeout: 5000,
    });

    if (!response.ok) {
      return res.status(502).json({
        error: `Home Assistant returned ${response.status}`,
        state: 'unknown',
        name: PLUG_NAME,
      });
    }

    const data = await response.json();
    res.json({
      state: data.state,
      name: data.attributes?.friendly_name || PLUG_NAME,
      last_changed: data.last_changed,
      entity_id: HA_ENTITY_ID,
    });
  } catch (err) {
    res.status(503).json({
      error: err.message,
      state: 'unknown',
      name: PLUG_NAME,
    });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Home Assistant: ${HA_URL}`);
  console.log(`Entity: ${HA_ENTITY_ID}`);
});
