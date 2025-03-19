import axios from "axios";
import refreshAccessToken from "./refreshToken";
import Swal from "sweetalert2";

let API_URL = "";
const role = localStorage.getItem("role");
if (role === "Spectator") {
  API_URL = "https://localhost:44320/api/EventForSpectators";
} else {
  API_URL = "https://localhost:44320/api/Events/List";
}

const getPosts = async () => {
  try {
    let page = 1;
    const pageSize = 5;
    let allEvents = [];
    let hasMore = true;

    while (hasMore) {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}?page=${page}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!Array.isArray(response.data) || response.data.length === 0) {
          hasMore = false;
        } else {
          allEvents = [...allEvents, ...response.data];
          page++;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            try {
              const retryResponse = await axios.get(
                `${API_URL}?page=${page}&pageSize=${pageSize}`,
                {
                  headers: {
                    Authorization: `Bearer ${newToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (
                !Array.isArray(retryResponse.data) ||
                retryResponse.data.length === 0
              ) {
                hasMore = false;
              } else {
                allEvents = [...allEvents, ...retryResponse.data];
                page++;
              }
            } catch (retryError) {
              console.error(
                "Lỗi từ API sau refresh:",
                retryError.response?.data
              );
              return [];
            }
          } else {
            return [];
          }
        } else {
          console.error("Lỗi từ API:", error.response?.data);
          return [];
        }
      }
    }

    return allEvents;
  } catch (error) {
    return [];
  }
};

export default getPosts;

export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(
      `https://localhost:44320/api/EventForSpectators/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("reToken")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};
export const updateEvent = async (id, data) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://localhost:44320/api/Events/${id}`,
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
          const retryResponse = await axios.put(
            `https://localhost:44320/api/Events/${id}`,
            data,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
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
export const getEventEOGById = async (id) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Events/get-event-detail/?eventId=${id}`,
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
            `https://localhost:44320/api/Events/get-event-detail/?eventId=${id}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
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
