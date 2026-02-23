const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const queries = [
  { q: 'pixel art knight idle', name: 'hero_idle.gif' },
  { q: 'pixel art sword attack', name: 'hero_attack.gif' },
  { q: 'pixel art knight cheer', name: 'hero_win.gif' },
  { q: 'pixel art monster idle', name: 'demon_idle.gif' },
  { q: 'pixel art monster hurt', name: 'demon_hurt.gif' },
  { q: 'pixel art forest background', name: 'bg.gif' }
];

async function fetchGiphy(query) {
  return new Promise((resolve) => {
    http.get(`http://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=dc6zaTOxFJmzC&limit=1`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data.length > 0) {
            resolve(json.data[0].images.original.url);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function download(url, dest) {
  return new Promise((resolve) => {
    const p = url.startsWith('https') ? https : http;
    p.get(url, (res) => {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', () => resolve());
  });
}

async function run() {
  for (const q of queries) {
    console.log('Searching', q.q);
    const url = await fetchGiphy(q.q);
    if (url) {
      console.log('Found', url);
      await download(url, path.join(dir, q.name));
    } else {
      console.log('Not found', q.q);
    }
  }
}

run().then(() => console.log('Done'));
