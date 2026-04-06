import type { RoleType } from "@prisma/client";

export interface ISuperAdminRepository {
  findAdminRole(): Promise<{ id: string; name: string } | null>;
  findUserByEmailNotDeleted(email: string): Promise<{ id: string } | null>;
  createAdminUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    roleId: string;
  }): Promise<{ id: string; email: string; fullName: string; role: { name: string } }>;
  findUserWithRoleNotDeleted(id: string): Promise<{ id: string; role: { name: string } } | null>;
  softDeleteUser(id: string): Promise<void>;
  findRoleByName(name: RoleType): Promise<{ id: string } | null>;
  updateUserRole(id: string, roleId: string): Promise<{ id: string; email: string; fullName: string; role: { name: string } }>;
  getConfigValue(key: string): Promise<unknown | null>;
  getAllConfig(): Promise<Record<string, unknown>>;
  patchConfig(key: string, value: unknown): Promise<void>;
  getPaymentConfig(): Promise<unknown>;
  patchPaymentConfig(value: Record<string, unknown>): Promise<void>;
  getShippingProviders(): Promise<unknown[]>;
  patchShippingProviders(value: unknown[]): Promise<void>;
  getFeatureFlags(): Promise<Record<string, boolean>>;
  patchFeatureFlags(value: Record<string, boolean>): Promise<void>;
  topProducts(limit: number): Promise<{ productId: string; productName: string; unitsSold: number; revenue: number }[]>;
  analytics(days: number): Promise<unknown>;
}
