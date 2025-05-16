// src/setupTests.ts
import "@testing-library/jest-dom";

// Mock environment variables
process.env.VITE_ENCRYPTION_SALT = "test-salt-for-jest";
process.env.VITE_SECRET_KEY = "test-secret-key-for-jest";

// Extend global interface
declare global {
  namespace NodeJS {
    interface Global {
      import: any;
    }
  }
}

// Mock the import.meta.env
(global as any).import = {
  meta: {
    env: {
      VITE_ENCRYPTION_SALT: "test-salt-for-jest",
      VITE_SECRET_KEY: "test-secret-key-for-jest",
    },
  },
};

// Mock toastUtils to avoid dependencies on DOM during tests
jest.mock("./utils/toastUtils", () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}));
