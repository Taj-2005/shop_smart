/** Composition-only: keeps AuthService free of direct repository/registry wiring in the class file. */
export { authNotificationStrategies, sessionTokenIssuer } from "../../services/registry";
export { prismaRefreshTokenStore } from "../../repositories/PrismaRefreshTokenStore";
export { prismaRoleReader } from "../../repositories/PrismaRoleReader";
export { prismaUserCredentialReader } from "../../repositories/PrismaUserCredentialReader";
export { prismaUserCredentialWriter } from "../../repositories/PrismaUserCredentialWriter";
