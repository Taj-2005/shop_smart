import { PrismaClient } from "@prisma/client";

const globalForDatabaseService = globalThis as unknown as {
  databaseService?: DatabaseService;
};

let productionInstance: DatabaseService | undefined;

export class DatabaseService {
  private readonly prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? [{ emit: "stdout", level: "error" }]
          : [],
    });
  }

  static getInstance(): DatabaseService {
    if (process.env.NODE_ENV !== "production") {
      globalForDatabaseService.databaseService ??= new DatabaseService();
      return globalForDatabaseService.databaseService;
    }
    productionInstance ??= new DatabaseService();
    return productionInstance;
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
