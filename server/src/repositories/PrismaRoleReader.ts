import type { RoleType, PrismaClient } from "@prisma/client";
import type { IRoleReader } from "../interfaces/IRoleReader";

export class PrismaRoleReader implements IRoleReader {
  constructor(private readonly prisma: PrismaClient) {}

  async findRoleIdByName(name: RoleType): Promise<string | null> {
    const row = await this.prisma.role.findUnique({ where: { name }, select: { id: true } });
    return row?.id ?? null;
  }
}
