import axios from "axios";

const API_URL = "http://localhost:4000/posts";

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
