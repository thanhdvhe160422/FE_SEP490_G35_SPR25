import axios from "axios";
let API_URL = "";
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");
if (role === "Spectator") {
  API_URL = "https://localhost:44320/api/EventForSpectators";
} else {
  API_URL = "https://localhost:44320/api/Events/List";
}

const getPosts = async () => {
  try {
    let page = 1;
    const pageSize = 5;
    let hasMore = true;
    let allEvents = [];

    while (hasMore) {
      try {
        const response = await axios.get(
          `${API_URL}?page=${page}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(`📢 API response for page ${page}:`, response.data);

        if (!Array.isArray(response.data) || response.data.length === 0) {
          hasMore = false;
        } else {
          allEvents = [...allEvents, ...response.data];
          page++;
        }
      } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
        hasMore = false;
      }
    }

    console.log("📌 Tổng số sự kiện nhận được:", allEvents.length);
    return allEvents;
  } catch (error) {
    console.error("❌ Lỗi trong getPosts():", error);
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
