import axios from "axios";
const refreshAccessToken = async () => {
  const refreshToken = sessionStorage.getItem("reToken");
  const accessToken = localStorage.getItem("token");
  //   console.log("Refresh Token hiện tại:", accessToken);
  try {
    const response = await axios.post(
      "https://localhost:44320/api/Auth/refresh-token",
      {
        refreshToken: refreshToken,
        accessToken: accessToken,
      }
    );

    console.log(response.data);

    const newAccessToken = response.data.accessToken;
    sessionStorage.setItem("token", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Lỗi refresh token:", error);
    return null;
  }
};
export default refreshAccessToken;
