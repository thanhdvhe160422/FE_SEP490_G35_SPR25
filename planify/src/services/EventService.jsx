import axios from "axios";

const API_URL = "https://localhost:44320/api/Events";

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
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`https://localhost:44320/api/Events/get-event-detail`, {
      params: { eventId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};
