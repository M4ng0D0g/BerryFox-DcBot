module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json'
    }
  },
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/tests/__mocks__/@prisma/client.js',
    '^\\.\\./src\/(.*)\\.js$': '<rootDir>/src/$1.ts',
    '^\\.\\/src\/(.*)\\.js$': '<rootDir>/src/$1.ts',
    '^src\/(.*)\\.js$': '<rootDir>/src/$1.ts',
    '^\\.\\./llm\/(.*)\\.js$': '<rootDir>/src/llm/$1.ts',
    '^\\.\\./services\/(.*)\\.js$': '<rootDir>/src/services/$1.ts',
    '^\\.\\./commands\/(.*)\\.js$': '<rootDir>/src/commands/$1.ts',    '^\.\./cache\/redis\.js$': '<rootDir>/tests/__mocks__/src/cache/redis.js',    '^\\.\\./cache\/(.*)\\.js$': '<rootDir>/src/cache/$1.ts',
    '^\\.\\./monitor\/(.*)\\.js$': '<rootDir>/src/monitor/$1.ts',
    '^\\.\\./handlers\/(.*)\\.js$': '<rootDir>/src/handlers/$1.ts',
    '^\.\/services\/(.*)\.js$': '<rootDir>/src/services/$1.ts',
    '^\.\/apiRouter\.js$': '<rootDir>/src/services/apiRouter.ts',
    '^\.\/apiExecutor\.js$': '<rootDir>/src/services/apiExecutor.ts',
    '^\.\/commands\/(.*)\.js$': '<rootDir>/src/commands/$1.ts',
    '^\\.\\/cache\/(.*)\\.js$': '<rootDir>/src/cache/$1.ts',
    '^\\.\\/monitor\/(.*)\\.js$': '<rootDir>/src/monitor/$1.ts',
    '^\\.\\/handlers\/(.*)\\.js$': '<rootDir>/src/handlers/$1.ts',
    '^\.\/db\.js$': '<rootDir>/src/services/db.ts',
    '^\.\/pgvector\.js$': '<rootDir>/src/services/pgvector.ts',
    '^\.\.\/scripts\/(.*)\.js$': '<rootDir>/scripts/$1.ts',
    '^\.\.\/db\.js$': '<rootDir>/tests/__mocks__/src/db.js'
  }
};
