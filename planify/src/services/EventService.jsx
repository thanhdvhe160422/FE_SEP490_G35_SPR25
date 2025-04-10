import axios from "axios";
import refreshAccessToken from "./refreshToken";
import Swal from "sweetalert2";

const getPosts = async (page, pageSize, role) => {
  let API_URL = "";
  if (role === "Spectator") {
    API_URL = "https://localhost:44320/api/EventForSpectators";
  } else {
    API_URL = "https://localhost:44320/api/Events/List";
  }
  try {
    let hasMore = true;
    while (hasMore) {
      try {
        const token = localStorage.getItem("token");
        //console.log("sang"+role);
        const response = await axios.get(
          `${API_URL}?page=${page}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
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
              return retryResponse.data;
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

    return;
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
          Authorization: `Bearer ${localStorage.getItem("reToken")}`,
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
  console.log("data call api: ", data);
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
            "Unable to update event after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating event:", error);
    Swal.fire("Error", "Unable to update event.", "error");
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
          const retryResponse = await axios.get(
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
            "Unable to get event by id after token refresh.",
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
    Swal.fire("Error", "Unable to get event by id.", "error");
    return null;
  }
};
export const getEventSpecById = async (id) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/EventForSpectators/${id}`,
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
            `https://localhost:44320/api/EventForSpectators/${id}`,
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
export const searchEvents = async (params) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Events/search`,
      {
        params: {
          createBy: params.createBy || undefined,
          page: params.page || undefined,
          pageSize: params.pageSize || undefined,
          title: params.title || undefined,
          placed: params.placed || undefined,
          startTime: params.startTime || undefined,
          endTime: params.endTime || undefined,
          status: params.status || undefined,
          CategoryEventId: params.CategoryEventId || undefined,
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
            `https://localhost:44320/api/Events/search`,
            {
              params: {
                page: params.page || 1,
                pageSize: params.pageSize || 5,
                title: params.title || undefined,
                placed: params.placed || undefined,
                startTime: params.startTime || undefined,
                endTime: params.endTime || undefined,
                status: params.status || undefined,
                createBy: params.createBy || undefined,
                CategoryEventId: params.CategoryEventId || undefined,
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

    console.error("Error searching events:", error);
    return null;
  }
};
export const updateMedia = async (data) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://localhost:44320/api/Events/update-event-media`,
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
            `https://localhost:44320/api/Events/delete-event-media`,
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
            "Unable to update media after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error delete media event:", error);
    Swal.fire("Error", "Unable to delete media event.", "error");
    return null;
  }
};
export const searchEventsSpec = async (params) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/EventForSpectators/search`,
      {
        params: {
          name: params.name || undefined,
          page: params.page || undefined,
          pageSize: params.pageSize || undefined,
          placed: params.placed || undefined,
          startDate: params.startDate || undefined,
          endDate: params.endDate || undefined,
          categoryId: params.categoryId || undefined,
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
            `https://localhost:44320/api/EventForSpectators/search`,
            {
              params: {
                name: params.name || undefined,
                page: params.page || undefined,
                pageSize: params.pageSize || undefined,
                placed: params.placed || undefined,
                startDate: params.startDate || undefined,
                endDate: params.endDate || undefined,
                categoryId: params.categoryId || undefined,
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

    console.error("Error searching events:", error);
    return null;
  }
};
export const createFavoriteEvent = async (eventId) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/FavouriteEvent/create/${eventId}`,
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
        try {
          const retryResponse = await axios.post(
            `https://localhost:44320/api/FavouriteEvent/create/${eventId}`,
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

    console.error("Lỗi khi tạo favorite:", error.response?.data || error);
    return null;
  }
};

export const deleteFavouriteEvent = async (id) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.delete(
      `https://localhost:44320/api/FavouriteEvent/delete/${id}`,
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
          const retryResponse = await axios.delete(
            `https://localhost:44320/api/FavouriteEvent/delete/${id}`,
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
export const getFavouriteEvents = async (page, pageSize) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/FavouriteEvent/get-list?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/FavouriteEvent/get-list?page=${page}&pageSize=${pageSize}`,
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

export const getNotification = async () => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Events/notification`,
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
            `https://localhost:44320/api/Events/notification`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to get notification after token refresh.",
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error get notification:", error);
    Swal.fire("Error", "Unable to get notification.", "error");
    return null;
  }
};
export const RegisterParticipant = async (eventId, userId) => {
  var formData = {
    eventId: eventId,
    userId: userId,
  };
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/Participant/register`,
      formData,
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
            `https://localhost:44320/api/Participant/register`,
            formData,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to register participant after token refresh.\n" +
              retryError.response?.data?.message,
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error register participant:", error);
    Swal.fire(
      "Error",
      "Unable to register participant.\n" + error.response?.data?.message,
      "error"
    );
    return null;
  }
};
export const IsRegisterParticipant = async (eventId) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Participant/is-register/${eventId}`,
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
            `https://localhost:44320/api/Participant/is-register/${eventId}`,
            eventId,
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

    console.error("Error register participant:", error);
    return null;
  }
};
export const DeleteRegisterParticipant = async (eventId, userId) => {
  var formData = {
    eventId: eventId,
    userId: userId,
  };
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/Participant/unregister`,
      formData,
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
            `https://localhost:44320/api/Participant/unregister`,
            formData,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire(
            "Error",
            "Unable to unregister participant after token refresh.\n" +
              retryError.response?.data?.message,
            "error"
          );
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error register participant:", error);
    Swal.fire(
      "Error",
      "Unable to unregister participant.\n" + error.response?.data?.message,
      "error"
    );
    return null;
  }
};
export const getMyFavouriteEvents = async (page, pageSize) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/FavouriteEvent/get-list/v2?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/FavouriteEvent/get-list?page=${page}&pageSize=${pageSize}`,
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
export const GetRegisterdByUserId = async () => {
  let token = localStorage.getItem("token");
  let userId = localStorage.getItem("userId");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Participant/registered/${userId}`,
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
            `https://localhost:44320/api/Participant/registered/${userId}`,
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

    console.error("Error get registerd by userId:", error);
    return null;
  }
};
export const getMyEvents = async (page, pageSize) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Events/my-event?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/Events/my-event?page=${page}&pageSize=${pageSize}`,
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
