const csv = require('csv-parser');
const { Readable } = require('stream');
const Papa = require('papaparse');

function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    stream
      .pipe(csv({ skipLines: 0, mapHeaders: ({ header }) => header.trim() }))
      .on('data', (data) => {
        const normalized = {};
        for (const k of Object.keys(data)) {
          normalized[k.trim().toLowerCase()] = (data[k] || '').trim();
        }
        results.push({
          name: normalized['name'] || '',
          role: normalized['role'] || '',
          company: normalized['company'] || '',
          industry: normalized['industry'] || '',
          location: normalized['location'] || '',
          linkedin_bio: normalized['linkedin_bio'] || ''
        });
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function writeResultsToCSVBuffer(results) {
  const csvStr = Papa.unparse(results);
  return Buffer.from(csvStr);
}

module.exports = { parseCSVBuffer, writeResultsToCSVBuffer };
