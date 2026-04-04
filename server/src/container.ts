import type { PrismaClient } from "@prisma/client";
import { prisma } from "./config/prisma";
import type { ITokenService } from "./interfaces/ITokenService";
import { BcryptHashService } from "./services/BcryptHashService";
import { NodemailerEmailService } from "./services/NodemailerEmailService";
import { ServiceFactory } from "./factories/ServiceFactory";
import { AuthService } from "./modules/auth/auth.service";
import { AdminService } from "./modules/admin/admin.service";
import { OrderService } from "./modules/orders/orders.service";
import { ProductService } from "./modules/products/products.service";
import { SuperAdminService } from "./modules/super-admin/super-admin.service";
import { UsersService } from "./modules/users/users.service";
import { CurrentUserProfileService } from "./modules/user/user.service";
import { createCartController } from "./modules/cart/cart.controller";
import { createCategoriesController } from "./modules/categories/categories.controller";
import { createReviewsController } from "./modules/reviews/reviews.controller";

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
    this.tokenService = ServiceFactory.resolveTokenService();
    this.hashService = ServiceFactory.createHashService();
    this.emailService = ServiceFactory.createEmailService();

    this.authService = ServiceFactory.createAuthService(db, {
      tokenService: this.tokenService,
      hashService: this.hashService,
      emailService: this.emailService,
    });

    ServiceFactory.bindAuthMiddleware(db, this.tokenService);

    this.adminService = ServiceFactory.createAdminService(db);
    this.orderService = ServiceFactory.createOrderService(db);
    this.productService = ServiceFactory.createProductService(db);
    this.superAdminService = ServiceFactory.createSuperAdminService(db, this.hashService);

    const { usersService, currentUserProfileService } = ServiceFactory.createUsersService(db);
    this.usersService = usersService;
    this.currentUserProfileService = currentUserProfileService;

    this.cartController = ServiceFactory.createCartController(db);
    this.categoriesController = ServiceFactory.createCategoriesController(db);
    this.reviewsController = ServiceFactory.createReviewsController(db);
  }
}

export const container = new AppContainer(prisma);
