import { RoleType } from "@prisma/client";
import { AppErrorFactory } from "../../factories/AppErrorFactory";
import type { IHashService } from "../../interfaces/IHashService";
import type { ISuperAdminRepository } from "../../interfaces/ISuperAdminRepository";

export class SuperAdminService {
  constructor(
    private readonly hash: IHashService,
    private readonly repo: ISuperAdminRepository
  ) {}

  async createAdmin(input: { email: string; password: string; fullName?: string }) {
    const { email, password, fullName } = input;
    if (!email || !password) throw AppErrorFactory.validation("email and password required");
    const normalizedEmail = String(email).toLowerCase().trim();
    const adminRole = await this.repo.findAdminRole();
    if (!adminRole) throw AppErrorFactory.validation("ADMIN role not found", { statusCode: 500, code: "INTERNAL_ERROR" });
    const existing = await this.repo.findUserByEmailNotDeleted(normalizedEmail);
    if (existing) throw AppErrorFactory.conflict("User already exists");
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
    if (!target) throw AppErrorFactory.notFound("User not found");
    if (target.role.name === "SUPER_ADMIN")
      throw AppErrorFactory.unauthorized("Cannot delete Super Admin", { statusCode: 403, code: "FORBIDDEN" });
    await this.repo.softDeleteUser(id);
  }

  async updateUserRole(id: string, role: string) {
    const allowed = ["ADMIN", "CUSTOMER"];
    if (!role || !allowed.includes(role)) {
      throw AppErrorFactory.validation("role must be one of: " + allowed.join(", "));
    }
    const roleRecord = await this.repo.findRoleByName(role as RoleType);
    if (!roleRecord) throw AppErrorFactory.notFound("Role not found", { statusCode: 400 });
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
