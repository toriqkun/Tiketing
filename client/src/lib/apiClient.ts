export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://tiketing-api.onrender.com/api/v1";

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Important for cookies
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || "An error occurred");
  }

  return data;
};
