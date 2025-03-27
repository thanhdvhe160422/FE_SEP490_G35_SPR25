import axios from "axios";

const API_URL = "https://localhost:44320/api/Categories";

const getCategories = async () => {
  try {
    const campus = localStorage.getItem("campus");
    let campusId;
    switch (campus) {
      case "Hòa Lạc":
        campusId = 1;
        break;
      case "Hồ Chí Minh":
        campusId = 2;
        break;
      case "Đà Nẵng":
        campusId = 3;
        break;
      case "Cần Thơ":
        campusId = 4;
        break;
      case "Quy Nhơn":
        campusId = 5;
        break;
      default:
        campusId = 5;
        break;
    }
    const response = await axios.get(`${API_URL}/${campusId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export default getCategories;

export const getCategoryByCampusId = async(campusId) =>{
  try{
    return axios.get(`${API_URL}/${campusId}`);
  }catch(error){
    console.error('Error get campus:', error.response || error);
    return [];
  }
}
export const createCategory = async(data,token) =>{
  try{
    return axios.post(`${API_URL}`,data,{
      headers:{
        Authorization: `Bearer ${token}`,
      },
    });
  }catch(error){
    console.error('Error create category:', error.response || error);
  }
}
export const updateCategory = async(data,token) =>{
  try{
    return axios.put(`${API_URL}`,data,{
      headers:{
        Authorization: `Bearer ${token}`,
      },
    });
  }catch(error){
    console.error('Error update category:', error.response || error);
  }
}
export const deleteCategory = async(categoryId,token) =>{
  try{
    return axios.delete(`${API_URL}/${categoryId}`,{
      headers:{
        Authorization: `Bearer ${token}`,
      },
    });
  }catch(error){
    console.error('Error delete category:', error.response || error);
    return null;
  }
}