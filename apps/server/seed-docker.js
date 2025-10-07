#!/usr/bin/env node

/**
 * Docker Seeding Script
 *
 * This script is used to seed the database when running in a Docker container.
 * It makes an HTTP request to the seeder API endpoint.
 *
 * Usage (inside Docker container):
 *   node seed-docker.js [command]
 *
 * Commands:
 *   seed   - Seed communities (default)
 *   clear  - Clear all communities
 *   reset  - Reset (clear + seed)
 *   status - Check seeding status
 */

const http = require('node:http');

const command = process.argv[2] || 'seed';
const port = process.env.PORT || 4200;

const options = {
  hostname: 'localhost',
  port: port,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Map command to endpoint
const endpointMap = {
  seed: '/api/seeder/seed',
  clear: '/api/seeder/clear',
  reset: '/api/seeder/reset',
  status: '/api/seeder/status',
};

const endpoint = endpointMap[command];

if (!endpoint) {
  console.error(`Unknown command: ${command}`);
  console.log('Available commands: seed, clear, reset, status');
  process.exit(1);
}

options.path = endpoint;
options.method = command === 'status' ? 'GET' : 'POST';

console.log(`Executing ${command} command...`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error) {
      console.error('Failed to parse response:', error.message);
      console.log('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Request failed:', error.message);
  console.log('\nMake sure the backend server is running!');
  process.exit(1);
});

req.end();
