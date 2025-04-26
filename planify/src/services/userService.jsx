import axios from "axios";
import refreshAccessToken from "./refreshToken";

const API_PROFILE_URL = "https://localhost:44320/api/Profiles";

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
export const createEventOrganizer = async (data) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/Users/event-organizer`,
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
            `https://localhost:44320/api/Users/event-organizer`,
            data,
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

    console.error("Error create event organizer:", error);
    return null;
  }
};
export const getListEOG = async (page, pageSize) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/event-organizer?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/Users/event-organizer?page=${page}&pageSize=${pageSize}`,
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

    console.error("Error get list eog:", error);
    return error?.response;
  }
};
export const updateEventOrganizer = async (userId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://localhost:44320/api/Users/update-eog-role?userId=${userId}&roleId=5`,
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
            `https://localhost:44320/api/Users/update-eog-role?userId=${userId}&roleId=5`,
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

    console.error("Error update event organizer:", error);
    return null;
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

//Manager Campus
export const getListManager = async (page, pageSize) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/campus-manager?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/Users/campus-manager?page=${page}&pageSize=${pageSize}`,
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
export const updateCampusManager = async (userId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://localhost:44320/api/Users/update-manager-role?userId=${userId}&roleId=5`,
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
            `https://localhost:44320/api/Users/update-manager-role?userId=${userId}&roleId=5`,
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
export const createCampusManager = async (data) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/Users/create-campus-manager`,
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
            `https://localhost:44320/api/Users/create-campus-manager`,
            data,
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

//List Users (ADMIN)
export const getListUser = async (page, pageSize) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/get-list-user?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/Users/get-list-user?page=${page}&pageSize=${pageSize}`,
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
export const banUser = async (Id) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://localhost:44320/api/Users/ban/unban-users/${Id}`,
      null,
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
            `hhttps://localhost:44320/api/Users/ban/unban-users/${Id}`,
            null,
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

export const searchUser = async (page, pageSize, input) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/get-list-user?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/Users/get-list-user?page=${page}&pageSize=${pageSize}`,
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
export const getSpectatorAndImplementer = async (page, pageSize, input) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/get-implementer-and-spectator?page=${page}&pageSize=${pageSize}&input=${input}`,
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
            `https://localhost:44320/api/Users/get-implementer-and-spectator?page=${page}&pageSize=${pageSize}&input=${input}`,
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
    if (error.response?.status === 404) {
      return {
        items: [],
        totalCount: 0,
        page: { page },
        pageSize: { pageSize },
      };
    }

    console.error("Error get spectator and implementer:", error);
    return null;
  }
};

export const setEOG = async (userid) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/set-event-organizer?id=${userid}`,
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
            `https://localhost:44320/api/Users/set-event-organizer?id=${userid}`,
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
