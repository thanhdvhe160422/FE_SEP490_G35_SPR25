import axios from "axios";
import refreshAccessToken from "./refreshToken";
import Swal from "sweetalert2";

export const approveRequest = async (id, reason) => {
  let token = localStorage.getItem("token");
  const payload = { id, reason };
  console.log("🚀 Sending request with payload:", payload);
  try {
    const response = await axios.put(
      `https://fptu-planify.com/api/SendRequest/${id}/approve`,
      { id, reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(
            `https://fptu-planify.com/api/SendRequest/${id}/approve`,
            { id, reason },
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to submit approve after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }
    Swal.fire("Error", "Unable to submit approve.", "error");
    return null;
  }
};

export const rejectRequest = async (id, reason) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://fptu-planify.com/api/SendRequest/${id}/reject`,
      {
        id,
        reason,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(
            `https://fptu-planify.com/api/SendRequest/${id}/reject`,
            { id, reason },
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to submit approve after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }
    Swal.fire("Error", "Unable to submit approve.", "error");
    return null;
  }
};
export const getRequest = async () => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://fptu-planify.com/api/SendRequest`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(
            `https://fptu-planify.com/api/SendRequest`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to get request after token refresh. " +
              error.response?.message,
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    Swal.fire(
      "Error",
      "Unable to get request. " + error.response?.message,
      "error"
    );
    return null;
  }
};
export const getMyRequest = async (userId) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://fptu-planify.com/api/SendRequest/MyRequests/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(
            `https://fptu-planify.com/api/SendRequest/MyRequests/${userId}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    return null;
  }
};
export const sendRequest = async (eventId) => {
  let token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `https://fptu-planify.com/api/SendRequest`,
      { eventId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(
            `https://fptu-planify.com/api/SendRequest`,
            { eventId },
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to submit approve after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }
    Swal.fire("Error", "Unable to submit approve.", "error");
    return null;
  }
};
export const searchMyRequest = async (page, pageSize, status, userId) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://fptu-planify.com/api/SendRequest/search?page=${page}&pageSize=${pageSize}&requestStatus=${status}&userId=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(
            `https://fptu-planify.com/api/SendRequest/search?page=${page}&pageSize=${pageSize}&requestStatus=${status}&userId=${userId}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    return null;
  }
};
export const searchRequest = async (page, pageSize, status) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://fptu-planify.com/api/SendRequest/search?page=${page}&pageSize=${pageSize}&requestStatus=${status}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(
            `https://fptu-planify.com/api/SendRequest/search?page=${page}&pageSize=${pageSize}&requestStatus=${status}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    return null;
  }
};
