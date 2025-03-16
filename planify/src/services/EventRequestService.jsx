import axios from "axios";

const API_URL = "https://localhost:44320/api/SendRequest";
const token = localStorage.getItem("token");
export const approveRequest = async (id, managerId) => {
  await axios.put(
    `${API_URL}/${id}/approve`,
    { id, managerId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const rejectRequest = async (eventId, reason) => {
  await axios.post(`${API_URL}`, { eventId, reason });
};
