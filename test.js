const fs = require('fs');
const https = require('https');

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/TMDB_API_KEY=(.+)/);
const apiKey = match ? match[1].trim().replace(/['"]+/g, '') : '';

const queryTMDB = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
};

(async () => {
  console.log("=== ANIME + ROMANCE KEYWORD (9840) ===");
  const res3 = await queryTMDB(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&with_original_language=ja&with_keywords=9840`);
  console.log(`Anime + Romance Keyword -> Total Results: ${res3.total_results}`);
})();
