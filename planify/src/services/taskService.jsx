import axios from "axios";
import refreshAccessToken from "./refreshToken";
import Swal from "sweetalert2";

const API_TASK_URL = "https://localhost:44320/api/Tasks";

export const createTaskAPI = async (taskData, token) => {
  return await axios.post(`${API_TASK_URL}/create`, taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getGroupTasks = async (groupId) => {
  return await axios.get(`https://your-api-url.com/groups/${groupId}/tasks`);
};
export const getListTask = async (eventId, token) => {
  console.log("api url: " + `${API_TASK_URL}/list/${eventId}`);
  const response = await fetch(`${API_TASK_URL}/list/${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks: " + response.Error);
  }

  return response.json();
};
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
export const updateTask = async (taskId, data, token) => {
  console.log(`${API_TASK_URL}/update/${taskId}`);
  return await axios.put(`${API_TASK_URL}/update/${taskId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteTask = async (taskId, token) => {
  return await axios.put(`${API_TASK_URL}/delete/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
