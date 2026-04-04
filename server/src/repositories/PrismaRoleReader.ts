import type { RoleType } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { IRoleReader } from "../interfaces/IRoleReader";

export class PrismaRoleReader implements IRoleReader {
  async findRoleIdByName(name: RoleType): Promise<string | null> {
    const row = await prisma.role.findUnique({ where: { name }, select: { id: true } });
    return row?.id ?? null;
  }
}

export const prismaRoleReader = new PrismaRoleReader();
