/**
 * Test Server - Uses bizcardly_test database
 * 
 * This server loads .env.test instead of .env to ensure
 * all SuperAdmin testing happens against a separate database.
 * 
 * Usage: node server.test.js
 * Runs on port 5001 by default (set PORT in .env.test)
 */

const path = require('path');
const fs = require('fs');

// Load .env.test BEFORE requiring server.js
const envPath = path.resolve(__dirname, '.env.test');
console.log('🧪 Loading .env.test from:', envPath);
console.log('🧪 .env.test exists:', fs.existsSync(envPath));

require('dotenv').config({ path: envPath });

console.log('🧪 Starting Bizcardly TEST Server...');
console.log('🧪 Database:', process.env.MONGO_URI ? 'bizcardly_test' : 'NOT SET');

// Now require and start the actual server
require('./server.js');
