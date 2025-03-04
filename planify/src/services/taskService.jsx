// src/services/taskService.jsx
import axios from "axios";

const API_URL = "http://localhost:4000/tasks";

export const getGroupTasks = async (groupId) => {
  try {
    console.log("Fetching tasks from:", API_URL);

    const response = await axios.get(API_URL);

    console.log("Tasks fetched:", response.data);

    return response.data.filter(
      (task) => Number(task.groupId) === Number(groupId)
    );
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};
