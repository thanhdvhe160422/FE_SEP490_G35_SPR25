import axios from "axios";
import refreshAccessToken from "./refreshToken";
import Swal from "sweetalert2";
import "../styles/Group/UpdateGroup.css";

const API_URL = "https://localhost:44320/api/Groups";

export const getGroupDetails = async (id) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.get(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to get group information after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        return { error: "expired" };
      }
    }
    console.error("Error fetching group details:", error);
    Swal.fire("Error", "Unable to get group information.", "error");
    return null;
  }
};
export const updateGroup = async (id, data) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.put(`${API_URL}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Token expired, refreshing...");
      const newToken = await refreshAccessToken();

      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.put(`${API_URL}/${id}`, data, {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to update group after token refresh.",
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
    Swal.fire("Error", "Unable to update group.", "error");
    return null;
  }
};
export const addImplementer = async (data) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/JoinGroup/add-implementer`,
      data,
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
          const retryResponse = await axios.post(
            `https://localhost:44320/api/JoinGroup/add-implementer`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to get group information after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        return { error: "expired" };
      }
    }
    console.error("Error fetching group details:", error);
    Swal.fire("Error", "Unable to get group information.", "error");
    return null;
  }
};
