import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { IHashService } from "../interfaces/IHashService";

const SALT_ROUNDS = 12;

export class BcryptHashService implements IHashService {
  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
