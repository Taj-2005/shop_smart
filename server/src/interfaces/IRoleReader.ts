import type { RoleType } from "@prisma/client";

export interface IRoleReader {
  findRoleIdByName(name: RoleType): Promise<string | null>;
}
