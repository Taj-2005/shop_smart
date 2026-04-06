import { RoleType } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";
import type { IHashService } from "../../interfaces/IHashService";
import type { ISuperAdminRepository } from "../../interfaces/ISuperAdminRepository";

export class SuperAdminService {
  constructor(
    private readonly hash: IHashService,
    private readonly repo: ISuperAdminRepository
  ) {}

  async createAdmin(input: { email: string; password: string; fullName?: string }) {
    const { email, password, fullName } = input;
    if (!email || !password) throw new AppError(400, "email and password required", "VALIDATION_ERROR");
    const normalizedEmail = String(email).toLowerCase().trim();
    const adminRole = await this.repo.findAdminRole();
    if (!adminRole) throw new AppError(500, "ADMIN role not found", "INTERNAL_ERROR");
    const existing = await this.repo.findUserByEmailNotDeleted(normalizedEmail);
    if (existing) throw new AppError(409, "User already exists", "CONFLICT");
    const passwordHash = await this.hash.hashPassword(password);
    return this.repo.createAdminUser({
      email: normalizedEmail,
      passwordHash,
      fullName: fullName || email,
      roleId: adminRole.id,
    });
  }

  async deleteAdmin(id: string) {
    const target = await this.repo.findUserWithRoleNotDeleted(id);
    if (!target) throw new AppError(404, "User not found", "NOT_FOUND");
    if (target.role.name === "SUPER_ADMIN") throw new AppError(403, "Cannot delete Super Admin", "FORBIDDEN");
    await this.repo.softDeleteUser(id);
  }

  async updateUserRole(id: string, role: string) {
    const allowed = ["ADMIN", "CUSTOMER"];
    if (!role || !allowed.includes(role)) {
      throw new AppError(400, "role must be one of: " + allowed.join(", "), "VALIDATION_ERROR");
    }
    const roleRecord = await this.repo.findRoleByName(role as RoleType);
    if (!roleRecord) throw new AppError(400, "Role not found", "NOT_FOUND");
    return this.repo.updateUserRole(id, roleRecord.id);
  }

  getConfigValue(key: string) {
    return this.repo.getConfigValue(key);
  }

  getAllConfig() {
    return this.repo.getAllConfig();
  }

  patchConfig(key: string, value: unknown) {
    return this.repo.patchConfig(key, value);
  }

  getPaymentConfig() {
    return this.repo.getPaymentConfig();
  }

  patchPaymentConfig(value: Record<string, unknown>) {
    return this.repo.patchPaymentConfig(value);
  }

  getShippingProviders() {
    return this.repo.getShippingProviders();
  }

  patchShippingProviders(value: unknown[]) {
    return this.repo.patchShippingProviders(value);
  }

  getFeatureFlags() {
    return this.repo.getFeatureFlags();
  }

  patchFeatureFlags(value: Record<string, boolean>) {
    return this.repo.patchFeatureFlags(value);
  }

  topProducts(limit: number) {
    return this.repo.topProducts(limit);
  }

  analytics(days: number) {
    return this.repo.analytics(days);
  }
}
