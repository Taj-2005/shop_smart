export interface IUser {
  id: string;
  email: string;
  fullName: string;
  [key: string]: unknown;
}

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(data: Record<string, unknown>): Promise<IUser>;
  update(id: string, data: Record<string, unknown>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}
