import axios from "axios";
import Authorization from "../components/Authorization";

export const createTaskAPI = async (taskData,token) => {
  return await axios.post("https://localhost:44320/api/Tasks/create", taskData,{
      headers:{
        'Authorization': `Bearer ${token}`,
      }
  });
};
export const getGroupTasks = async (groupId) => {
  return await axios.get(`https://your-api-url.com/groups/${groupId}/tasks`);
};
export const getListTask = async (groupId,token) => {
  const response =  await fetch(`https://localhost:44320/api/Tasks/list/${groupId}`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
}
export const getSeachListTasks = async (page,pageSize,name,startDate,endDate,token) => {
  return await axios.get(`https://localhost:44320/api/Tasks/search?page=${page}&pageSize=${pageSize}
    &name=${name}&startDate=${startDate}&endDate=${endDate}`,{
      headers:{
        'Authorization':`Bearer ${token}`
      }
    })
}
export const updateAmountBudget = async(taskId, amountBudget, token) => {
  return await axios.put(`https://localhost:44320/api/Tasks/${taskId}/amount`,amountBudget,{
    headers:{
      'Authorization':`Bearer ${token}`
    }
  })
}
export const updateTask = async(taskId,data,token) =>{
  return await axios.put(`https://localhost:44320/api/Tasks/update/${taskId}`,data,{
    headers:{
      'Authorization': `Bearer ${token}`
    }
  })
}
export const deleteTask = async(taskId,token) =>{
  return await axios.put(`https://localhost:44320/api/Tasks/delete/${taskId}`,{
    headers:{
      'Authorization': `Bearer ${token}`
    }
  })
}