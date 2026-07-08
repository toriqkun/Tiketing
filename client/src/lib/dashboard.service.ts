import { apiClient } from "./apiClient";

export const getDashboardSummary = async () => {
  return apiClient("/dashboard/summary", {
    method: "GET",
  });
};
