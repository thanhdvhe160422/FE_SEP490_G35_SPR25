import axios from "axios";
import Authorization from "../components/Authorization";

const API_TASK_URL = 'https://localhost:44320/api/Tasks';

export const createTaskAPI = async (taskData,token) => {
  return await axios.post(`${API_TASK_URL}/create`, taskData,{
      headers:{
        'Authorization': `Bearer ${token}`,
      }
  });
};
export const getGroupTasks = async (groupId) => {
  return await axios.get(`https://your-api-url.com/groups/${groupId}/tasks`);
};
export const getListTask = async (eventId,token) => {
  console.log("api url: "+`${API_TASK_URL}/list/${eventId}`)
  const response =  await fetch(`${API_TASK_URL}/list/${eventId}`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tasks: '+ response.Error);
  }

  return response.json();
}
export const getSeachListTasks = async (page,pageSize,name,startDate,endDate,token) => {
  return await axios.get(`${API_TASK_URL}/search?page=${page}&pageSize=${pageSize}
    &name=${name}&startDate=${startDate}&endDate=${endDate}`,{
      headers:{
        'Authorization':`Bearer ${token}`
      }
    })
}
export const updateAmountBudget = async(taskId, amountBudget, token) => {
  return await axios.put(`${API_TASK_URL}/${taskId}/amount`,amountBudget,{
    headers:{
      'Authorization':`Bearer ${token}`
    }
  })
}
export const updateTask = async(taskId,data,token) =>{
  console.log(`${API_TASK_URL}/update/${taskId}`);
  return await axios.put(`${API_TASK_URL}/update/${taskId}`,data,{
    headers:{
      'Authorization': `Bearer ${token}`
    }
  })
}
export const deleteTask = async(taskId,token) =>{
  return await axios.put(`${API_TASK_URL}/delete/${taskId}`,{
    headers:{
      'Authorization': `Bearer ${token}`
    }
  })
}
export const getTaskById = async(taskId,token)=>{
  return await axios.get(`${API_TASK_URL}/${taskId}`,{
    headers:{
      'Authorization':`Bearer ${token}`
    }
  })
}