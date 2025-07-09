const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../data');

async function readJSON(file) {
  try {
    const filePath = path.join(dataDir, file);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

async function writeJSON(file, data) {
  const filePath = path.join(dataDir, file);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };
