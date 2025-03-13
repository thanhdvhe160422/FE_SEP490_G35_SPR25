import axios from "axios";
const refreshAccessToken = async () => {
  const refreshToken = sessionStorage.getItem("reToken");
  const accessToken = localStorage.getItem("token");
  try {
    const response = await axios.post(
      "https://localhost:44320/api/Auth/refresh-token",
      {
        refreshToken: refreshToken,
        accessToken: accessToken,
      }
    );

    console.log("Hello");

    const newAccessToken = response.data.accessToken;
    localStorage.setItem("token", newAccessToken);
    sessionStorage.setItem("reToken", response.data.refreshToken);
    console.log(newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Lỗi refresh token:", error);
    return null;
  }
};
export default refreshAccessToken;
