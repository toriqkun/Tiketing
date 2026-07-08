import { apiClient } from "./apiClient";

export const getAccounts = async (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`/accounts${query ? `?${query}` : ""}`, {
    method: "GET",
  });
};

export const getAccountById = async (id: string) => {
  return apiClient(`/accounts/${id}`, {
    method: "GET",
  });
};

export const updateAccount = async (id: string, data: any) => {
  return apiClient(`/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteAccount = async (id: string, data: any) => {
  return apiClient(`/accounts/${id}`, {
    method: "DELETE",
    body: JSON.stringify(data),
  });
};

export const updateAccountStatus = async (id: string, data: any) => {
  return apiClient(`/accounts/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const adminResetPassword = async (id: string, data: any) => {
  return apiClient(`/accounts/${id}/admin-reset-password`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const confirmPassword = async (password: string) => {
  return apiClient("/accounts/confirm-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
};
