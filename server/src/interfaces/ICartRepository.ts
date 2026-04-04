export interface ICartRepository {
  findCartWithItems(userId: string): Promise<unknown | null>;
  ensureCart(userId: string): Promise<{ id: string }>;
  upsertItem(cartId: string, productId: string, quantity: number): Promise<void>;
  findCartWithItemsById(cartId: string): Promise<unknown | null>;
  findCartByUserId(userId: string): Promise<{ id: string } | null>;
  findItemInCart(cartId: string, itemId: string): Promise<{ id: string } | null>;
  deleteItem(itemId: string): Promise<void>;
  updateItemQuantity(itemId: string, quantity: number): Promise<unknown>;
}
