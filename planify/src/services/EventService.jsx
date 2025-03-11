import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "https://localhost:44320/api/EventForSpectators";

const getPosts = async (page, pageSize) => {
  try {
    const response = await axios.get(
      `${API_URL}?page=${page}&pageSize=${pageSize}`,
      {
        params: { page, pageSize },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("reToken")}`,
        },
      }
    );
    console.log("API response:", response.data);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export default getPosts;

export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(
      `https://localhost:44320/api/EventForSpectators/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("reToken")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};
