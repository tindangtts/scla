// Set env vars before any module imports
process.env.SESSION_SECRET = "test-secret-at-least-32-characters-long-for-hmac";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
