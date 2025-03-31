import axios from "axios";
import refreshAccessToken from "./refreshToken";
import Swal from "sweetalert2";

const API_TASK_URL = "https://localhost:44320/api/Tasks";

export const createTaskAPI = async (taskData) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/Tasks/create`,
      taskData,
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
            `https://localhost:44320/api/Tasks/create`,
            taskData,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire("Error", "Not found any tasks.", "error");
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    Swal.fire("Error", "Not found any tasks.", "error");
    return null;
  }
};
const getListTask = async (eventId, page, pageSize) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Tasks/list/${eventId}?page=${page}&pageSize=${pageSize}`,
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
            `https://localhost:44320/api/Tasks/list/${eventId}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire("Error", "Not found any tasks.", "error");
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    Swal.fire("Error", "Not found any tasks.", "error");
    return null;
  }
};
export default getListTask;

export const getSeachListTasks = async (
  page,
  pageSize,
  name,
  startDate,
  endDate,
  token
) => {
  return await axios.get(
    `${API_TASK_URL}/search?page=${page}&pageSize=${pageSize}
    &name=${name}&startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const updateAmountBudget = async (taskId, amountBudget, token) => {
  return await axios.put(`${API_TASK_URL}/${taskId}/amount`, amountBudget, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateTask = async (taskId, data) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://localhost:44320/api/Tasks/update/${taskId}`,
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
            `https://localhost:44320/api/Tasks/update/${taskId}`,
            data,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire("Error", "Not found any tasks.", "error");
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    Swal.fire("Error", "Not found any tasks.", "error");
    return null;
  }
};
export const deleteTask = async (taskId, status) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `https://localhost:44320/api/Tasks/${taskId}/status/${status}`,
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
            `https://localhost:44320/api/Tasks/${taskId}/status/${status}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          console.error("Lỗi từ API sau refresh:", retryError.response?.data);
          Swal.fire("Error", "Not found any tasks.", "error");
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }

    console.error("Error updating group:", error);
    Swal.fire("Error", "Not found any tasks.", "error");
    return null;
  }
};
export const getTaskById = async (taskId, token) => {
  return await axios.get(`${API_TASK_URL}/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getTaskListByImplementer = async (idImplementer, start, end) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `https://localhost:44320/api/Tasks/search/v2?implementerId=${idImplementer}&startDate=${start}&endDate=${end}`,
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
            `https://localhost:44320/api/Tasks/search/v2?implementerId=${idImplementer}&startDate=${start}&endDate=${end}`,
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
