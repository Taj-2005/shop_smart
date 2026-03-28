"use client";

import { apiClient } from "./axios";

export type DashboardData = {
  users: number;
  products: number;
  orders: number;
  revenue: number;
};

export type ApiResponse<T> = { success: boolean; data: T };

export const adminApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardData>>("/api/admin/dashboard").then((r) => r.data),

  getRevenue: () =>
    apiClient.get<ApiResponse<{ total: number }>>("/api/admin/revenue").then((r) => r.data),

  getUsersStats: () =>
    apiClient.get<ApiResponse<{ total: number; byRole: { roleId: string; roleName: string; count: number }[] }>>("/api/admin/users/stats").then((r) => r.data),

  getProductsStats: () =>
    apiClient.get<ApiResponse<{ total: number; active: number }>>("/api/admin/products/stats").then((r) => r.data),

  getOrdersStats: () =>
    apiClient.get<ApiResponse<{ status: string; _count: number }[]>>("/api/admin/orders/stats").then((r) => r.data),

  /** Sales by status (count + total revenue per status). */
  getSalesReport: () =>
    apiClient
      .get<ApiResponse<{ status: string; count: number; total: number }[]>>("/api/admin/reports/sales")
      .then((r) => r.data),

  /** Daily trend (orders + revenue by day) for the last N days. */
  getTrend: (days?: number) =>
    apiClient
      .get<ApiResponse<{ date: string; orders: number; revenue: number }[]>>("/api/admin/reports/trend", {
        params: { days: days ?? 30 },
      })
      .then((r) => r.data),

  /** Sales by category (delivered order items: name, count, revenue). */
  getSalesByCategory: () =>
    apiClient
      .get<ApiResponse<{ name: string; count: number; revenue: number }[]>>("/api/admin/reports/by-category")
      .then((r) => r.data),

  createAdmin: (data: { email: string; password: string; fullName?: string }) =>
    apiClient.post<ApiResponse<{ id: string; email: string; fullName: string; role: unknown }>>("/api/super-admin/admins", data).then((r) => r.data),

  getLogs: (limit?: number) =>
    apiClient.get<ApiResponse<unknown[]>>("/api/admin/logs", { params: { limit } }).then((r) => r.data),

  listOrders: (params?: { limit?: number; status?: string }) =>
    apiClient.get<ApiResponse<AdminOrder[]>>("/api/admin/orders", { params }).then((r) => r.data),

  getReviews: (params?: { limit?: number; status?: string }) =>
    apiClient.get<ApiResponse<AdminReview[]>>("/api/admin/reviews", { params }).then((r) => r.data),
};

export type AdminOrder = {
  id: string;
  userId: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  items: Array<{ id: string; productId: string; quantity: number; price: number; product?: { id: string; name: string; image: string } }>;
  user?: { id: string; email: string; fullName: string };
};

export type AdminReview = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  body: string | null;
  status: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  product: { id: string; name: string; slug: string };
};
