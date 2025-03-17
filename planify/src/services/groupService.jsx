import axios from "axios";
const API_URL = "https://localhost:44320/api/Groups";

export const getGroupDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
};
