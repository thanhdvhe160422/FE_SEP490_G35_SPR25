import axios from "axios";

const API_URL = "https://fptu-planify.com/api/Campus/List";

export const getCampuses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Lỗi:", error);
    return [];
  }
};
export const getCampusIdByName = async (name) => {
  try {
    const response = await axios.get(
      `https://fptu-planify.com/api/Campus/${name}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi tìm campus theo tên: ", error);
  }
};
