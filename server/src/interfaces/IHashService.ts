/** Password and opaque token hashing (DIP: auth depends on this abstraction). */
export interface IHashService {
  hashPassword(plain: string): Promise<string>;
  comparePassword(plain: string, hashed: string): Promise<boolean>;
  hashToken(token: string): string;
  generateToken(): string;
}
