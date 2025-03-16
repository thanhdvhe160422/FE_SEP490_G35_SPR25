import axios from "axios";

const API_URL = "https://localhost:44320/api/SendRequest";

export const approveRequest = async (eventId, managerId) => {
  await axios.put(`${API_URL}/${eventId}/approve`, { eventId, managerId });
};

export const rejectRequest = async (eventId, reason) => {
  await axios.post(`${API_URL}/${eventId}/reject`, {
    idEvent: eventId,
    reason,
  });
};
