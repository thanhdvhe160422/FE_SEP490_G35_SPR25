import axios from "axios";

export const createTaskAPI = async (taskData) => {
  return await axios.post("https://localhost:44320/api/Tasks/create", taskData);
};
export const getGroupTasks = async (groupId) => {
  return await axios.get(`https://your-api-url.com/groups/${groupId}/tasks`);
};
