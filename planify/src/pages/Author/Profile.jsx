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
        const userId = localStorage.getItem("userId");
        const userRes = await fetch(
          "https://localhost:44320/api/Profiles/" + userId
        );
        const userData = await userRes.json();

        setUser(userData);
        console.log("Dữ liệu người dùng: " + JSON.stringify(userData, null, 2));
        if (userData.avatar) {
          setimage(userData.avatar.mediaUrl || "");
        } else {
          setimage(localStorage.getItem("avatar"));
        }
        setAddress(userData.addressVM.addressDetail || "");
        setProvinces(
          userData.addressVM.wardVM.districtVM.provinceVM.provinceName
        );
        setDistricts(userData.addressVM.wardVM.districtVM.districtName || "");
        setWards(userData.addressVM.wardVM.wardName || "");

        console.log("Địa chỉ:", userData.addressVM.addressDetail || "");
        console.log(
          "Tỉnh/Thành phố:",
          userData.addressVM.wardVM.districtVM.provinceVM.provinceName || ""
        );
        console.log(
          "Quận/Huyện:",
          userData.addressVM.wardVM.districtVM.districtName || ""
        );
        console.log("Phường/Xã:", userData.addressVM.wardVM.wardName || "");

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (!user) return <p>Không tìm thấy dữ liệu người dùng</p>;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  function convertToDirectLink(googleDriveUrl) {
    if (!googleDriveUrl.includes("drive.google.com/uc?id="))
      return googleDriveUrl;
    const fileId = googleDriveUrl.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return (
    <>
      <Header />
      <div style={{ paddingTop: "100px" }} className="profile-container">
        <div className="profile-card">
          <img
            src={convertToDirectLink(image)}
            alt="Ảnh đại diện"
            className="profile-avatar"
          />
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
              <FaRegEdit /> Cập nhật hồ sơ
            </button>
          </div>
        </div>

        <div className="profile-form">
          <h2>Thông tin hồ sơ</h2>
          <table className="profile-table">
            <tbody>
              <tr>
                <td>Họ và tên</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
              </tr>
              <tr>
                <td>Ngày sinh</td>
                <td>{formatDate(user.dateOfBirth)}</td>
              </tr>
              <tr>
                <td>Giới tính</td>
                <td>{user.gender ? "Nam" : "Nữ"}</td>
              </tr>
              <tr>
                <td>Địa chỉ</td>
                <td>
                  {address ? (
                    `${address}, ${wards}, ${districts}, ${provinces}`
                  ) : (
                    <span className="text-danger fst-italic">
                      Chưa có địa chỉ
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td>Số điện thoại</td>
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
