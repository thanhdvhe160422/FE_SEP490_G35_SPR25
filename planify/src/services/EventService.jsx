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
          Authorization: `${sessionStorage.getItem("its-cms-refreshToken")}`,
        },
      }
    );
    console.log("API response:", response.data);
    if (Array.isArray(response.data)) {
      return response.data;
    }

    Cookies.remove("its-cms-accessToken");
    sessionStorage.removeItem("its-cms-refreshToken");
    Cookies.set("its-cms-accessToken", response.data.data.csrfToken);
    sessionStorage.setItem(
      "its-cms-refreshToken",
      response.data.data.refreshToken
    );

    console.error("Dữ liệu API không đúng định dạng mong đợi:", response.data);
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
          Authorization: `${sessionStorage.getItem("its-cms-refreshToken")}`,
        },
      }
    );
    if (response.data.csrfToken) {
      Cookies.set("its-cms-accessToken", response.data.csrfToken);
    }
    if (response.data.refreshToken) {
      sessionStorage.setItem(
        "its-cms-refreshToken",
        response.data.refreshToken
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
};
