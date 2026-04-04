// Ensure env has required vars for tests (avoid throwing in config).
// Prisma validates the URL scheme; must match schema provider (postgresql).
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@127.0.0.1:5432/shopsmart_test";
process.env.NODE_ENV = "test";
