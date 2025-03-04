import axios from "axios";
const API_URL = "http://localhost:4000/groups";

export const getGroupDetails = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
};
