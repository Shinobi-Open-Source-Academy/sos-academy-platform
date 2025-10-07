#!/usr/bin/env node

/**
 * Docker Auto-Seeding Script
 *
 * This script automatically checks if the database needs seeding and seeds it if necessary.
 * It's designed to be run before the application starts in Docker.
 *
 * Usage:
 *   node auto-seed-docker.js
 */

const http = require('node:http');

const port = process.env.PORT || 4200;
const maxRetries = 30; // 30 seconds timeout
let retryCount = 0;

console.log('🔍 Checking database seeding status...');

function checkAndSeed() {
  // First, check status
  const statusOptions = {
    hostname: 'localhost',
    port: port,
    path: '/api/seeder/status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(statusOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);

        if (result.count === 0) {
          console.log('📦 Database is empty. Seeding communities...');
          seedDatabase();
        } else {
          console.log(`✓ Database already seeded (${result.count} communities found)`);
          process.exit(0);
        }
      } catch (error) {
        console.error('Failed to parse status response:', error.message);
        process.exit(0); // Don't fail, allow app to start
      }
    });
  });

  req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED' && retryCount < maxRetries) {
      retryCount++;
      console.log(`Waiting for backend to be ready... (${retryCount}/${maxRetries})`);
      setTimeout(checkAndSeed, 1000);
    } else if (retryCount >= maxRetries) {
      console.error('⚠️  Backend not ready after 30 seconds. Skipping auto-seed.');
      process.exit(0);
    } else {
      console.error('Request failed:', error.message);
      process.exit(0);
    }
  });

  req.end();
}

function seedDatabase() {
  const seedOptions = {
    hostname: 'localhost',
    port: port,
    path: '/api/seeder/seed',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(seedOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Database seeded successfully');
        console.log('Response:', JSON.stringify(result, null, 2));
        process.exit(0);
      } catch (error) {
        console.error('Failed to parse seed response:', error.message);
        process.exit(0);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Seed request failed:', error.message);
    console.log('⚠️  Application will start without seeding');
    process.exit(0);
  });

  req.end();
}

// Start the check
checkAndSeed();
