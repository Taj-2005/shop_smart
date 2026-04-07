import { IUserRepository, IUser } from '../interfaces/IUserRepository';
import { prisma } from '../../config/prisma';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return user as unknown as IUser;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user as unknown as IUser;
  }

  async create(data: Record<string, unknown>): Promise<IUser> {
    const user = await prisma.user.create({ data: data as never });
    return user as unknown as IUser;
  }

  async update(id: string, data: Record<string, unknown>): Promise<IUser | null> {
    const user = await prisma.user.update({
      where: { id },
      data: data as never,
    });
    return user as unknown as IUser;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
