import axios from "axios";

const API_ADDRESS_URL = "https://fptu-planify.com/api/Address";

export const getProvinces = async () => {
  try {
    return axios.get(`${API_ADDRESS_URL}/Provinces`);
  } catch (error) {
    console.error("Error get province:", error.response || error);
  }
};
export const getDistricts = async (provinceId) => {
  try {
    return axios.get(`${API_ADDRESS_URL}/District/id?id=${provinceId}`);
  } catch (error) {
    console.error("Error get province:", error.response || error);
  }
};
export const getWards = async (districtId) => {
  try {
    return axios.get(`${API_ADDRESS_URL}/Ward/id?id=${districtId}`);
  } catch (error) {
    console.error("Error get province:", error.response || error);
  }
};
