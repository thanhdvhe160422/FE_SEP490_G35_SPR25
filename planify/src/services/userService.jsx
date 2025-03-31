import axios from "axios";
import refreshAccessToken from "./refreshToken";

const API_PROFILE_URL = "https://localhost:44320/api/Profiles";
const API_USER_URL = "https://localhost:44320/api/Users";

export const getProfileById = async (userId, token) => {
  try {
    return await axios.get(`${API_PROFILE_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error get profile by id:", error.message);
    throw error;
  }
};
export const updateProfile = async (data, token) => {
  try {
    return await axios.put(`${API_PROFILE_URL}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error update profile:", error.response || error);
    throw error;
  }
};
export const updateAvatar = async (userId, image, token) => {
  try {
    return await axios.put(`${API_PROFILE_URL}/${userId}/image`, image, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error.response || error);
    throw error;
  }
};
export const createEventOrganizer = async (data, token) => {
  try {
    return await axios.post(`${API_USER_URL}/event-organizer`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error create event organizer:", error.response || error);
    throw error;
  }
};

export const updateEventOrganizer = async (data, token) => {
  try {
    return await axios.put(`${API_USER_URL}/event-organizer`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error update event organizer:", error.response || error);
    throw error;
  }
};
export const getUserJoinEvent = async (eventId) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/getListImplementer/${eventId}?page=1&pageSize=10`,
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
            `https://localhost:44320/api/Users/getListImplementer/${eventId}?page=1&pageSize=10`,
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
