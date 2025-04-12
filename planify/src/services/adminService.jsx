import axios from "axios";
import refreshAccessToken from "./refreshToken";
export const getCategoryAdmin = async () => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Dashboard/used-categories`,
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
          const retryResponse = await axios.get(
            `https://localhost:44320/api/Dashboard/used-categories`,
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
export const getEventByYear = async (year) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Dashboard/monthly-stats?year=${year}`,
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
          const retryResponse = await axios.get(
            `https://localhost:44320/api/Dashboard/monthly-stats?year=${year}`,
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
export const getEventByParticipant = async () => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Dashboard/top-events-by-participants`,
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
          const retryResponse = await axios.get(
            `https://localhost:44320/api/Dashboard/top-events-by-participants`,
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
export const getNewEventByCampus = async (campusName) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Dashboard/latest-events?campusName=${campusName}`,
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
          const retryResponse = await axios.get(
            `https://localhost:44320/api/Dashboard/latest-events?campusName=${campusName}`,
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
export const getEventByCampus = async () => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Dashboard/percent-events`,
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
          const retryResponse = await axios.get(
            `https://localhost:44320/api/Dashboard/percent-events`,
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
export const searchUsers = async (params) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/search/v2`,
      {
        params: {
          page: params.page || undefined,
          pageSize: params.pageSize || undefined,
          input: params.input || undefined,
        },
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
          const retryResponse = await axios.get(
            `https://localhost:44320/api/Users/search/v2`,
            {
              params: {
                page: params.page || undefined,
                pageSize: params.pageSize || undefined,
                input: params.input || undefined,
              },
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
