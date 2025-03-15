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
