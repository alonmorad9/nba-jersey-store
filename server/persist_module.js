const fs = require('fs').promises; // Import the 'fs' module to handle file system operations asynchronously
const path = require('path'); // Import the 'path' module to handle file paths in a platform-independent way

const dataDir = path.join(__dirname, '../data'); // Define the directory where JSON files will be stored

// Ensure the data directory exists
async function readJSON(file) {
  try {
    const filePath = path.join(dataDir, file); // Construct the full path to the JSON file
    const data = await fs.readFile(filePath, 'utf-8'); // Read the file contents as a string
    return JSON.parse(data); // Parse the string into a JavaScript object
  } catch (err) {
    return {};
  }
}

// Write data to a JSON file
async function writeJSON(file, data) {
  const filePath = path.join(dataDir, file); // Construct the full path to the JSON file
  await fs.writeFile(filePath, JSON.stringify(data, null, 2)); // Write the data object to the file as a formatted JSON string
}

module.exports = { readJSON, writeJSON }; // Export the readJSON and writeJSON functions for use in other modules
