import { apiClient } from "./apiClient";

export interface CreateTicketData {
  ticket_type: string;
  description: string;
  target_username: string;
  target_email: string;
  target_phone: string;
}

export const createTicket = async (data: CreateTicketData) => {
  return apiClient("/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getTickets = async (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`/tickets${query ? `?${query}` : ""}`, {
    method: "GET",
  });
};

export const getTicketById = async (id: string) => {
  return apiClient(`/tickets/${id}`, {
    method: "GET",
  });
};

export const resubmitTicket = async (id: string, data: any) => {
  return apiClient(`/tickets/${id}/resubmit`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const reviewTicket = async (id: string, data: any) => {
  return apiClient(`/tickets/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const proofTicket = async (id: string, data: FormData) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/tickets/${id}/proof`, {
    method: "PUT",
    credentials: "include",
    body: data,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit proof');
  }
  return res.json();
};

export const confirmTicket = async (id: string, data: any) => {
  return apiClient(`/tickets/${id}/confirm`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
