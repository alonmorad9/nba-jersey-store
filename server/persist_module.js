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

const ACTIVITY_FILE = path.join(dataDir, 'activity.json');

async function appendActivity({ username, type }) { // Append an activity log entry
  try {
    const data = await fs.readFile(ACTIVITY_FILE, 'utf-8');
    const list = JSON.parse(data);
    list.push({
      datetime: new Date().toISOString(),
      username,
      type
    });
    await fs.writeFile(ACTIVITY_FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    // אם הקובץ לא קיים או ריק – מתחיל רשימה חדשה
    const list = [{
      datetime: new Date().toISOString(),
      username,
      type
    }];
    await fs.writeFile(ACTIVITY_FILE, JSON.stringify(list, null, 2));
  }
}

const usersDir = path.join(dataDir, 'users');

function userFilePath(username, filename) {
  return path.join(usersDir, username, filename);
}

async function readUserFile(username, filename) {
  try {
    const filePath = userFilePath(username, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeUserFile(username, filename, data) {
  const userDir = path.join(usersDir, username);
  await fs.mkdir(userDir, { recursive: true });
  const filePath = path.join(userDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}




module.exports = { readJSON, writeJSON, appendActivity, readUserFile, writeUserFile }; // Export the readJSON and writeJSON functions, along with activity logging and user file handling functions
