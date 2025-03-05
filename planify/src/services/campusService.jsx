import axios from "axios";

const API_URL = "https://localhost:44320/api/Campus";

export const getCampuses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi:", error);
    return [];
  }
};
