// API Configuration
const API_BASE_URL = "http://localhost:5000/api";

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("tripmate_token");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    console.log("API Call:", url, options);
    const response = await fetch(url, { ...defaultOptions, ...options });

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      throw new Error(`Invalid server response: ${response.statusText}`);
    }

    if (!response.ok) {
      console.error("API Error Response:", data);
      throw new Error(data.error || `HTTP ${response.status}: API Error`);
    }

    return data;
  } catch (error) {
    console.error("API Error Details:", error.message);
    console.error("Full error:", error);

    // Re-throw with better messaging
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Backend may not be running on port 5000");
    }
    if (error.message.includes("fetch")) {
      throw new Error("Connection error: Cannot reach backend server");
    }
    throw error;
  }
}

// Authentication API
const AuthAPI = {
  register: async (name, email, password, confirmPassword) => {
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  },

  login: async (email, password) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  googleLogin: async (token) => {
    return apiCall("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  facebookLogin: async (accessToken) => {
    return apiCall("/auth/facebook", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    });
  },

  verify: async () => {
    return apiCall("/auth/verify", { method: "GET" });
  },

  logout: () => {
    localStorage.removeItem("tripmate_token");
    localStorage.removeItem("tripmate_user");
  },
};

// Users API
const UsersAPI = {
  getProfile: async () => {
    return apiCall("/users/profile", { method: "GET" });
  },

  updateProfile: async (profileData) => {
    return apiCall("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  getBookingHistory: async () => {
    return apiCall("/users/bookings", { method: "GET" });
  },
};

// Destinations API
const DestinationsAPI = {
  getAll: async () => {
    return apiCall("/destinations", { method: "GET" });
  },

  getById: async (id) => {
    return apiCall(`/destinations/${id}`, { method: "GET" });
  },

  search: async (query) => {
    const params = new URLSearchParams(query).toString();
    return apiCall(`/destinations/search?${params}`, { method: "GET" });
  },

  addReview: async (id, text, rating) => {
    return apiCall(`/destinations/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify({ text, rating }),
    });
  },
};

// Bookings API
const BookingsAPI = {
  create: async (bookingData) => {
    return apiCall("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  getUserBookings: async () => {
    return apiCall("/bookings", { method: "GET" });
  },

  getById: async (id) => {
    return apiCall(`/bookings/${id}`, { method: "GET" });
  },

  updateStatus: async (id, status, paymentStatus) => {
    return apiCall(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, paymentStatus }),
    });
  },

  cancel: async (id) => {
    return apiCall(`/bookings/${id}`, { method: "DELETE" });
  },
};

// Payments API
const PaymentsAPI = {
  processPayPal: async (bookingId, orderId, amount) => {
    return apiCall("/payments/paypal", {
      method: "POST",
      body: JSON.stringify({ bookingId, orderId, amount }),
    });
  },

  processUPI: async (bookingId, upiId, amount) => {
    return apiCall("/payments/upi", {
      method: "POST",
      body: JSON.stringify({ bookingId, upiId, amount }),
    });
  },

  getHistory: async () => {
    return apiCall("/payments/history", { method: "GET" });
  },

  getById: async (id) => {
    return apiCall(`/payments/${id}`, { method: "GET" });
  },
};

// Stella AI API
const StellaAPI = {
  sendMessage: async (message, conversationId = null) => {
    return apiCall("/stella/message", {
      method: "POST",
      body: JSON.stringify({ message, conversationId }),
    });
  },

  getConversation: async (id) => {
    return apiCall(`/stella/conversation/${id}`, { method: "GET" });
  },
};

// Coupons API
const CouponsAPI = {
  validate: async (code, bookingAmount) => {
    return apiCall("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, bookingAmount }),
    });
  },

  apply: async (code) => {
    return apiCall("/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  getActive: async () => {
    return apiCall("/coupons/active", { method: "GET" });
  },
};

// Guides API
const GuidesAPI = {
  getAll: async () => {
    return apiCall("/guides", { method: "GET" });
  },

  getByDestination: async (destination) => {
    return apiCall(`/guides/destination/${destination}`, { method: "GET" });
  },

  getById: async (id) => {
    return apiCall(`/guides/${id}`, { method: "GET" });
  },

  addReview: async (id, text, rating) => {
    return apiCall(`/guides/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify({ text, rating }),
    });
  },
};

// Export all APIs
const API = {
  Auth: AuthAPI,
  Users: UsersAPI,
  Destinations: DestinationsAPI,
  Bookings: BookingsAPI,
  Payments: PaymentsAPI,
  Stella: StellaAPI,
  Coupons: CouponsAPI,
  Guides: GuidesAPI,
};
