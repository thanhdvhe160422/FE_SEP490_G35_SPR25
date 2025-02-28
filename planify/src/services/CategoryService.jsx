import axios from "axios";

const API_URL = "http://localhost:4000/categories"; // Địa chỉ API

const getCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export default getCategories;
