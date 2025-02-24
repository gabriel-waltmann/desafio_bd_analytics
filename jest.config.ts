const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['./__tests__/GlobalSetup.ts'],
  globalSetup: './__tests__/GlobalSetup.ts',
  globalTeardown: './__tests__/GlobalTeardown.ts',
  verbose: true,
  detectOpenHandles: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1' 
  }
};

export default config;