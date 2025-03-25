import React, { useEffect, useState } from "react";
import "../../styles/Author/Profile.css";
import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import { FaRegEdit } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState("");
  const [districts, setDistricts] = useState("");
  const [wards, setWards] = useState("");
  const [address, setAddress] = useState("");
  const [image, setimage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const thanh = localStorage.getItem("userId");
        setimage(localStorage.getItem("avatar"));
        const userRes = await fetch(
          "https://localhost:44320/api/Profiles/" + thanh
        );
        const userData = await userRes.json();

        setUser(userData);
        console.log(userData);
        setimage(userData.avatar.mediaUrl||"");
        setAddress(userData.addressVM.addressDetail || "");
        setProvinces(
          userData.addressVM.wardVM.districtVM.provinceVM.provinceName
        );
        setDistricts(userData.addressVM.wardVM.districtVM.districtName || "");
        setWards(userData.addressVM.wardVM.wardName || "");

        console.log("Address:", userData.addressVM.addressDetail || "");
        console.log(
          "Province:",
          userData.addressVM.wardVM.districtVM.provinceVM.provinceName || ""
        );
        console.log(
          "District:",
          userData.addressVM.wardVM.districtVM.districtName || ""
        );
        console.log("Ward:", userData.addressVM.wardVM.wardName || "");

        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu người dùng:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user data found</p>;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  function convertToDirectLink(googleDriveUrl) {
    
    if (!googleDriveUrl.includes("drive.google.com/uc?id=")) return googleDriveUrl;
    const fileId = googleDriveUrl.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}
  return (
    <>
      <Header />
      <div style={{ paddingTop: "100px" }} className="profile-container">
        <div className="profile-card">
          <img src={convertToDirectLink(image)} alt="Avatar" className="profile-avatar" />
          <h2>
            {user.firstName} {user.lastName}
          </h2>
          <p className="profile-email">{user.email}</p>

          <div
            className="edit-profile-button-container"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <button
              className="btn btn-info edit-profile-button"
              onClick={() => navigate("/update-profile")}
            >
              <FaRegEdit /> Update Profile
            </button>
          </div>
        </div>

        <div className="profile-form">
          <h2>Profile Information</h2>
          <table className="profile-table">
            <tbody>
              <tr>
                <td>Full Name</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
              </tr>
              <tr>
                <td>Date of Birth</td>
                <td>{formatDate(user.dateOfBirth)}</td>
              </tr>
              <tr>
                <td>Gender</td>
                <td>{user.gender ? "Male" : "Female"}</td>
              </tr>

              <tr>
                <td>Address</td>
                <td>
                  {address},{wards}, {districts}, {provinces}
                </td>
              </tr>
              <tr>
                <td>Phone Number</td>
                <td>{user.phoneNumber || ""}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{user.email || ""}</td>
              </tr>
            </tbody>
          </table>

          <div
            className="button"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              marginTop: "30px",
            }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default Profile;
