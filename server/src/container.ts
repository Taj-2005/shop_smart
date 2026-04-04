import type { PrismaClient } from "@prisma/client";
import { prisma } from "./config/prisma";
import { env } from "./config/env";
import { bindAuthenticationDependencies } from "./middleware/authenticate";
import type { ITokenService } from "./interfaces/ITokenService";
import { JwtTokenService } from "./services/JwtTokenService";
import { OAuthJwtTokenService } from "./services/OAuthJwtTokenService";
import { BcryptHashService } from "./services/BcryptHashService";
import { NodemailerEmailService } from "./services/NodemailerEmailService";
import { EmailNotificationStrategy } from "./services/EmailNotificationStrategy";
import { PushNotificationStrategy } from "./services/PushNotificationStrategy";
import { SmsNotificationStrategy } from "./services/SmsNotificationStrategy";
import { resolveOrderPricingStrategy } from "./services/registry";
import { PrismaUserCredentialReader } from "./repositories/PrismaUserCredentialReader";
import { PrismaUserCredentialWriter } from "./repositories/PrismaUserCredentialWriter";
import { PrismaRefreshTokenStore } from "./repositories/PrismaRefreshTokenStore";
import { PrismaRoleReader } from "./repositories/PrismaRoleReader";
import { PrismaAuthenticatedUserLoader } from "./repositories/PrismaAuthenticatedUserLoader";
import { PrismaUserReader } from "./repositories/PrismaUserReader";
import { PrismaUserWriter } from "./repositories/PrismaUserWriter";
import { PrismaAdminRepository } from "./repositories/PrismaAdminRepository";
import { PrismaOrderRepository } from "./repositories/PrismaOrderRepository";
import { PrismaProductRepository } from "./repositories/PrismaProductRepository";
import { PrismaSuperAdminRepository } from "./repositories/PrismaSuperAdminRepository";
import { PrismaCartRepository } from "./repositories/PrismaCartRepository";
import { PrismaCategoryRepository } from "./repositories/PrismaCategoryRepository";
import { PrismaReviewRepository } from "./repositories/PrismaReviewRepository";
import { AuthService } from "./modules/auth/auth.service";
import { AdminService } from "./modules/admin/admin.service";
import { OrderService } from "./modules/orders/orders.service";
import { ProductService } from "./modules/products/products.service";
import { SuperAdminService } from "./modules/super-admin/super-admin.service";
import { UsersService } from "./modules/users/users.service";
import { CurrentUserProfileService } from "./modules/user/user.service";
import { CartService } from "./modules/cart/cart.service";
import { CategoriesService } from "./modules/categories/categories.service";
import { ReviewsService } from "./modules/reviews/reviews.service";
import { createCartController } from "./modules/cart/cart.controller";
import { createCategoriesController } from "./modules/categories/categories.controller";
import { createReviewsController } from "./modules/reviews/reviews.controller";

function resolveTokenService(): ITokenService {
  const key = env.AUTH_PROVIDER.toLowerCase();
  if (key === "oauth_jwt") return new OAuthJwtTokenService();
  return new JwtTokenService();
}

/**
 * Composition root: register concrete implementations and expose services for HTTP layer.
 */
export class AppContainer {
  readonly tokenService: ITokenService;
  readonly hashService: BcryptHashService;
  readonly emailService: NodemailerEmailService;
  readonly authService: AuthService;
  readonly adminService: AdminService;
  readonly orderService: OrderService;
  readonly productService: ProductService;
  readonly superAdminService: SuperAdminService;
  readonly usersService: UsersService;
  readonly currentUserProfileService: CurrentUserProfileService;
  readonly cartController: ReturnType<typeof createCartController>;
  readonly categoriesController: ReturnType<typeof createCategoriesController>;
  readonly reviewsController: ReturnType<typeof createReviewsController>;

  constructor(db: PrismaClient) {
    this.tokenService = resolveTokenService();
    this.hashService = new BcryptHashService();
    this.emailService = new NodemailerEmailService();

    const userCredentialReader = new PrismaUserCredentialReader(db);
    const userCredentialWriter = new PrismaUserCredentialWriter(db);
    const refreshStore = new PrismaRefreshTokenStore(db);
    const roleReader = new PrismaRoleReader(db);
    const authenticatedUserLoader = new PrismaAuthenticatedUserLoader(db);

    const emailStrategy = new EmailNotificationStrategy(this.emailService);
    const authNotificationSenders = [emailStrategy, new SmsNotificationStrategy(), new PushNotificationStrategy()];

    this.authService = new AuthService(
      authNotificationSenders,
      this.tokenService,
      this.hashService,
      roleReader,
      userCredentialReader,
      userCredentialWriter,
      refreshStore
    );

    bindAuthenticationDependencies({
      accessTokenVerifier: this.tokenService,
      authenticatedUserLoader,
    });

    const adminRepo = new PrismaAdminRepository(db);
    this.adminService = new AdminService(adminRepo);

    const orderRepo = new PrismaOrderRepository(db);
    this.orderService = new OrderService(resolveOrderPricingStrategy(), orderRepo);

    const productRepo = new PrismaProductRepository(db);
    this.productService = new ProductService(productRepo);

    const superRepo = new PrismaSuperAdminRepository(db);
    this.superAdminService = new SuperAdminService(this.hashService, superRepo);

    const userReader = new PrismaUserReader(db);
    const userWriter = new PrismaUserWriter(db);
    this.usersService = new UsersService(userReader, userWriter);
    this.currentUserProfileService = new CurrentUserProfileService(userWriter);

    const cartRepo = new PrismaCartRepository(db);
    this.cartController = createCartController(new CartService(cartRepo));

    const categoryRepo = new PrismaCategoryRepository(db);
    this.categoriesController = createCategoriesController(new CategoriesService(categoryRepo));

    const reviewRepo = new PrismaReviewRepository(db);
    this.reviewsController = createReviewsController(new ReviewsService(reviewRepo));
  }
}

export const container = new AppContainer(prisma);
