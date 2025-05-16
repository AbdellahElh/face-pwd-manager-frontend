// src/setupVitestTests.ts
import { vi } from "vitest";

// Set process.env explicitly with type assertion
(process.env as any).VITE_ENCRYPTION_SALT = "test-salt-for-tests";
(process.env as any).VITE_SECRET_KEY = "test-secret-key-for-tests";

// Mock the import.meta.env for Vite
(global as any).import = {
  meta: {
    env: {
      VITE_ENCRYPTION_SALT: "test-salt-for-tests",
      VITE_SECRET_KEY: "test-secret-key-for-tests",
    },
  },
};

// Mock toastUtils to avoid dependencies on DOM during tests
vi.mock("./utils/toastUtils", () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));
