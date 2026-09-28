const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("hostelfix_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    // If response is not JSON
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) => request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    signup: (userData) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(userData) }),
    getMe: () => request("/api/auth/me"),
    updateProfile: (profile) => request("/api/auth/profile", { method: "PATCH", body: JSON.stringify(profile) }),
    getAllUsers: () => request("/api/auth/users"),
    updateUserRole: (userId, role) => request(`/api/auth/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  },
  complaints: {
    getCategories: () => request("/api/complaints/categories"),
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.append("status", params.status);
      if (params.category_id) query.append("category_id", params.category_id);
      if (params.search) query.append("search", params.search);
      if (params.my_only) query.append("my_only", "true");
      const qs = query.toString();
      return request(`/api/complaints${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/api/complaints/${id}`),
    create: (complaintData) => request("/api/complaints", { method: "POST", body: JSON.stringify(complaintData) }),
    updateStatus: (id, payload) => request(`/api/complaints/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  ai: {
    suggestCategory: (description) => request("/api/ai/suggest-category", { method: "POST", body: JSON.stringify({ description }) }),
    getWeeklySummary: () => request("/api/ai/weekly-summary"),
  },
  analytics: {
    getOverview: () => request("/api/analytics/overview"),
  },
  escalate: {
    runSweep: (hours = 24) => request(`/api/escalate/run?hours=${hours}`, { method: "POST" }),
  },
};
