import type { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { bindAuthenticationDependencies } from "../middleware/authenticate";
import type { IEmailProviderStrategy } from "../interfaces/IEmailProviderStrategy";
import type { ITokenService } from "../interfaces/ITokenService";
import { JwtTokenService } from "../services/JwtTokenService";
import { OAuthJwtTokenService } from "../services/OAuthJwtTokenService";
import { BcryptHashService } from "../services/BcryptHashService";
import { NodemailerEmailService } from "../services/NodemailerEmailService";
import { EmailNotificationStrategy } from "../services/EmailNotificationStrategy";
import { PushNotificationStrategy } from "../services/PushNotificationStrategy";
import { SmsNotificationStrategy } from "../services/SmsNotificationStrategy";
import { resolveOrderCommerceStrategies } from "../services/registry";
import { PrismaUserCredentialReader } from "../repositories/PrismaUserCredentialReader";
import { PrismaUserCredentialWriter } from "../repositories/PrismaUserCredentialWriter";
import { PrismaRefreshTokenStore } from "../repositories/PrismaRefreshTokenStore";
import { PrismaRoleReader } from "../repositories/PrismaRoleReader";
import { PrismaAuthenticatedUserLoader } from "../repositories/PrismaAuthenticatedUserLoader";
import { PrismaUserReader } from "../repositories/PrismaUserReader";
import { PrismaUserWriter } from "../repositories/PrismaUserWriter";
import { PrismaAdminRepository } from "../repositories/PrismaAdminRepository";
import { PrismaOrderRepository } from "../repositories/PrismaOrderRepository";
import { PrismaProductRepository } from "../repositories/PrismaProductRepository";
import { PrismaSuperAdminRepository } from "../repositories/PrismaSuperAdminRepository";
import { PrismaCartRepository } from "../repositories/PrismaCartRepository";
import { PrismaCategoryRepository } from "../repositories/PrismaCategoryRepository";
import { PrismaReviewRepository } from "../repositories/PrismaReviewRepository";
import { AuthService } from "../modules/auth/auth.service";
import { AdminService } from "../modules/admin/admin.service";
import { OrderService } from "../modules/orders/orders.service";
import { ProductService } from "../modules/products/products.service";
import { SuperAdminService } from "../modules/super-admin/super-admin.service";
import { UsersService } from "../modules/users/users.service";
import { CurrentUserProfileService } from "../modules/user/user.service";
import { CartService } from "../modules/cart/cart.service";
import { CategoriesService } from "../modules/categories/categories.service";
import { ReviewsService } from "../modules/reviews/reviews.service";
import { createCartController } from "../modules/cart/cart.controller";
import { createCategoriesController } from "../modules/categories/categories.controller";
import { createReviewsController } from "../modules/reviews/reviews.controller";
import { NodemailerStrategy } from "../strategies/email/NodemailerStrategy";
import { SendGridStrategy } from "../strategies/email/SendGridStrategy";

const emailProviderFactories: Record<string, () => IEmailProviderStrategy> = {
  nodemailer: () => new NodemailerStrategy(),
  sendgrid: () => new SendGridStrategy(),
};

function resolveTokenService(): ITokenService {
  const key = env.AUTH_PROVIDER.toLowerCase();
  if (key === "oauth_jwt") return new OAuthJwtTokenService();
  return new JwtTokenService();
}

/**
 * Creates application services and controllers (composition / factory for the HTTP layer).
 */
export class ServiceFactory {
  static resolveTokenService(): ITokenService {
    return resolveTokenService();
  }

  static createHashService(): BcryptHashService {
    return new BcryptHashService();
  }

  static resolveEmailProvider(): IEmailProviderStrategy {
    const key = env.EMAIL_PROVIDER.toLowerCase();
    const factory = emailProviderFactories[key] ?? emailProviderFactories.nodemailer;
    return factory();
  }

  static createEmailService(): NodemailerEmailService {
    return new NodemailerEmailService(ServiceFactory.resolveEmailProvider());
  }

  static createAuthService(
    db: PrismaClient,
    deps: { tokenService: ITokenService; hashService: BcryptHashService; emailService: NodemailerEmailService }
  ): AuthService {
    const userCredentialReader = new PrismaUserCredentialReader(db);
    const userCredentialWriter = new PrismaUserCredentialWriter(db);
    const refreshStore = new PrismaRefreshTokenStore(db);
    const roleReader = new PrismaRoleReader(db);
    const emailStrategy = new EmailNotificationStrategy(deps.emailService);
    const authNotificationSenders = [emailStrategy, new SmsNotificationStrategy(), new PushNotificationStrategy()];

    return new AuthService(
      authNotificationSenders,
      deps.tokenService,
      deps.hashService,
      roleReader,
      userCredentialReader,
      userCredentialWriter,
      refreshStore
    );
  }

  static bindAuthMiddleware(db: PrismaClient, tokenService: ITokenService): void {
    const authenticatedUserLoader = new PrismaAuthenticatedUserLoader(db);
    bindAuthenticationDependencies({
      accessTokenVerifier: tokenService,
      authenticatedUserLoader,
    });
  }

  static createAdminService(db: PrismaClient): AdminService {
    return new AdminService(new PrismaAdminRepository(db));
  }

  static createOrderService(db: PrismaClient): OrderService {
    const commerce = resolveOrderCommerceStrategies();
    return new OrderService(commerce.lines, commerce.discount, commerce.shipping, new PrismaOrderRepository(db));
  }

  static createProductService(db: PrismaClient): ProductService {
    return new ProductService(new PrismaProductRepository(db));
  }

  static createSuperAdminService(db: PrismaClient, hashService: BcryptHashService): SuperAdminService {
    return new SuperAdminService(hashService, new PrismaSuperAdminRepository(db));
  }

  static createUsersService(db: PrismaClient): { usersService: UsersService; currentUserProfileService: CurrentUserProfileService } {
    const userReader = new PrismaUserReader(db);
    const userWriter = new PrismaUserWriter(db);
    return {
      usersService: new UsersService(userReader, userWriter),
      currentUserProfileService: new CurrentUserProfileService(userWriter),
    };
  }

  static createCartController(db: PrismaClient): ReturnType<typeof createCartController> {
    const cartRepo = new PrismaCartRepository(db);
    const productRepo = new PrismaProductRepository(db);
    return createCartController(new CartService(cartRepo, productRepo));
  }

  static createCategoriesController(db: PrismaClient): ReturnType<typeof createCategoriesController> {
    return createCategoriesController(new CategoriesService(new PrismaCategoryRepository(db)));
  }

  static createReviewsController(db: PrismaClient): ReturnType<typeof createReviewsController> {
    return createReviewsController(new ReviewsService(new PrismaReviewRepository(db)));
  }
}
