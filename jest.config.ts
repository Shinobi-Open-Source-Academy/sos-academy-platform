import type { Config } from 'jest';

export default (): Config => ({
  projects: ['<rootDir>/apps/server', '<rootDir>/apps/server-e2e'],
});
