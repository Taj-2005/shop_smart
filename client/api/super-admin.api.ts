"use client";

import { apiClient } from "./axios";

export type ApiResponse<T> = { success: boolean; data: T };

export type ShippingProvider = { id?: string; name: string; enabled?: boolean };

export type SuperAdminAnalytics = {
  users: number;
  products: number;
  orders: number;
  revenue: number;
  refunded: number;
  cancelledCount: number;
  byStatus: { status: string; _count: number; total: number }[];
  recentOrders: {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    user: { email: string; fullName: string };
    items: { productName: string; quantity: number; price: number }[];
  }[];
  period: { days: number };
  comparison: {
    revenueCurrent: number;
    revenuePrevious: number;
    ordersCurrent: number;
    ordersPrevious: number;
    usersCurrent: number;
    usersPrevious: number;
  };
};

export type TopProduct = {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
};

export const superAdminApi = {
  createAdmin: (data: { email: string; password: string; fullName?: string }) =>
    apiClient.post<ApiResponse<{ id: string; email: string; fullName: string; role: unknown }>>("/api/super-admin/admins", data).then((r) => r.data),

  deleteAdmin: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/super-admin/admins/${id}`).then((r) => r.data),

  assignUserRole: (userId: string, role: "ADMIN" | "CUSTOMER") =>
    apiClient.patch<ApiResponse<unknown>>(`/api/super-admin/users/${userId}/role`, { role }).then((r) => r.data),

  getAnalytics: (days?: number) =>
    apiClient
      .get<ApiResponse<SuperAdminAnalytics>>("/api/super-admin/analytics", { params: days ? { days } : {} })
      .then((r) => r.data),

  getTopProducts: (limit?: number) =>
    apiClient
      .get<ApiResponse<TopProduct[]>>("/api/super-admin/analytics/top-products", { params: limit ? { limit } : {} })
      .then((r) => r.data),

  getConfig: (key?: string) =>
    apiClient.get<ApiResponse<unknown>>("/api/super-admin/config", { params: key ? { key } : {} }).then((r) => r.data),

  updateConfig: (key: string, value: unknown) =>
    apiClient.patch<ApiResponse<{ message: string }>>("/api/super-admin/config", { key, value }).then((r) => r.data),

  getPaymentConfig: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>("/api/super-admin/config/payment").then((r) => r.data),

  updatePaymentConfig: (value: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<{ message: string }>>("/api/super-admin/config/payment", value).then((r) => r.data),

  getShippingProviders: () =>
    apiClient.get<ApiResponse<ShippingProvider[]>>("/api/super-admin/config/shipping-providers").then((r) => r.data),

  updateShippingProviders: (value: ShippingProvider[]) =>
    apiClient.patch<ApiResponse<{ message: string }>>("/api/super-admin/config/shipping-providers", value).then((r) => r.data),

  getFeatureFlags: () =>
    apiClient.get<ApiResponse<Record<string, boolean>>>("/api/super-admin/config/feature-flags").then((r) => r.data),

  updateFeatureFlags: (value: Record<string, boolean>) =>
    apiClient.patch<ApiResponse<{ message: string }>>("/api/super-admin/config/feature-flags", value).then((r) => r.data),

};
