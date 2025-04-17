import axios from "axios";
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("reToken");
  const accessToken = localStorage.getItem("token");
  try {
    const response = await axios.post(
      "https://localhost:44320/api/Auth/refresh-token",
      {
        refreshToken: refreshToken,
        accessToken: accessToken,
      }
    );
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("token", newAccessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    console.log(newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Lỗi refresh token:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("reToken");

    window.location.href = "/login";
    return null;
  }
};
export default refreshAccessToken;
