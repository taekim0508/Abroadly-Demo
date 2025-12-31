module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  globals: {
    'import.meta': {
      env: {
        VITE_API_BASE_URL: 'http://localhost:8000',
        VITE_GOOGLE_MAPS_API_KEY: 'test-api-key',
      },
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'esnext',
        moduleResolution: 'node',
      }
    }]
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/react-app-env.d.ts',
    '!src/setupTests.ts',
    '!src/services/api.ts',
    '!src/components/PlacesMap.tsx',
    '!src/services/__mocks__/**',
    '!src/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 25,
      functions: 35,
      lines: 55,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  // Projects configuration for separate test suites
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/__tests__/unit/**/*.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
      },
      globals: {
        'import.meta': {
          env: {
            VITE_API_BASE_URL: 'http://localhost:8000',
            VITE_GOOGLE_MAPS_API_KEY: 'test-api-key',
          },
        },
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            module: 'esnext',
            moduleResolution: 'node',
          }
        }]
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/__tests__/**',
        '!src/index.tsx',
        '!src/reportWebVitals.ts',
        '!src/react-app-env.d.ts',
        '!src/setupTests.ts',
        '!src/services/api.ts',
        '!src/components/PlacesMap.tsx',
        '!src/services/__mocks__/**',
        '!src/__mocks__/**',
      ],
    },
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/__tests__/integration/**/*.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
      },
      globals: {
        'import.meta': {
          env: {
            VITE_API_BASE_URL: 'http://localhost:8000',
            VITE_GOOGLE_MAPS_API_KEY: 'test-api-key',
          },
        },
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            module: 'esnext',
            moduleResolution: 'node',
          }
        }]
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/__tests__/**',
        '!src/index.tsx',
        '!src/reportWebVitals.ts',
        '!src/react-app-env.d.ts',
        '!src/setupTests.ts',
        '!src/services/api.ts',
        '!src/components/PlacesMap.tsx',
        '!src/services/__mocks__/**',
        '!src/__mocks__/**',
      ],
    },
  ],
};
