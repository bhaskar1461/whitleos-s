const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

const file = path.join(__dirname, 'db.json');
const initialData = { journal: [], steps: [], meals: [], workouts: [], healthData: [], webhooks: [], connections: [] };
if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify(initialData, null, 2));
}
const adapter = new JSONFile(file);
const db = new Low(adapter, initialData);

module.exports = { db };
