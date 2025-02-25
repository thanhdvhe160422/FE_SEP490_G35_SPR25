import axios from "axios";

const API_URL = "http://localhost:4000/campuses";

export const getCampuses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi:", error);
    return [];
  }
};
