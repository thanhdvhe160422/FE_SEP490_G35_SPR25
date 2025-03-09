import axios from "axios";

const API_URL = "https://localhost:44320/api/EventForSpectators";

const getPosts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export default getPosts;
export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};
