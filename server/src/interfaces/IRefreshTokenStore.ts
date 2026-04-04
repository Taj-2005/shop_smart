import type { Prisma } from "@prisma/client";

export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: { user: { include: { role: true } } };
}>;

export interface IRefreshTokenStore {
  create(data: { id: string; tokenHash: string; userId: string; expiresAt: Date }): Promise<void>;
  findValidWithUser(jti: string, tokenHash: string): Promise<RefreshTokenWithUser | null>;
  revokeById(id: string): Promise<void>;
  revokeAllByTokenHash(tokenHash: string): Promise<void>;
}
