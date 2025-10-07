#!/usr/bin/env ts-node

/**
 * Database Seeding CLI Script
 *
 * This script is a wrapper that runs the main.ts file with seeder commands.
 * The actual seeding logic is in main.ts to avoid duplication and import issues.
 *
 * Usage:
 *   npx nx run server:seed          # Seed communities
 *   npx nx run server:seed:clear    # Clear all communities
 *   npx nx run server:seed:reset    # Reset (clear + seed)
 *   npx nx run server:seed:status   # Check seeding status
 */

// Simply re-export from main.ts which has all the seeding logic
import './main';
