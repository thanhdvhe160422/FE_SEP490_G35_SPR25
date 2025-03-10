import React, { useEffect, useState } from "react";
import "../../styles/Author/Profile.css";
import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import { FaRegEdit } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [address, setAddress] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
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
        setAddress(userData.addressVM.addressDetail||'');
        setProvinces(userData.addressVM.wardVM.districtVM.provinceVM.provinceName || "");
        setDistricts(userData.addressVM.wardVM.districtVM.districtName || "");
        setWards(userData.addressVM.wardVM.wardName || "");

        console.log("Address:", userData.addressVM.addressDetail || '');
console.log("Province:", userData.addressVM.wardVM.districtVM.provinceVM.provinceName || '');
console.log("District:", userData.addressVM.wardVM.districtVM.districtName || '');
console.log("Ward:", userData.addressVM.wardVM.wardName || '');


        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu người dùng:", error);
        setLoading(false);
      }
    };

    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://localhost:44320/api/Address/Provinces");
        const data = await res.json();
        setProvinces(data.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách tỉnh:", error);
        setProvinces([]);
      }
    };

    fetchUserData();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;

    const fetchDistricts = async () => {
      try {
        const res = await fetch(
          `https://esgoo.net/api-tinhthanh/2/${selectedProvince}.htm`
        );
        const data = await res.json();
        setDistricts(data.data || []);
        setWards([]);
        setSelectedDistrict("");
      } catch (error) {
        console.error("Lỗi lấy danh sách quận/huyện:", error);
        setDistricts([]);
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) return;

    const fetchWards = async () => {
      try {
        const res = await fetch(
          `https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`
        );
        const data = await res.json();
        setWards(data.data || []);
        setSelectedWard("");
      } catch (error) {
        console.error("Lỗi lấy danh sách phường/xã:", error);
        setWards([]);
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  const handleSave = async () => {
    try {
      const updatedUser = {
        ...user,
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        wardId: selectedWard,
      };

      await fetch("http://localhost:4000/users/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      alert("Profile updated!");
      navigate("/profile");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
    }
  };

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

  const getProvinceName = (provinceId) => {
    const province = provinces.find((p) => p.id === provinceId);
    return province ? province.name : "";
  };

  const getDistrictName = (districtId) => {
    const district = districts.find((d) => d.id === districtId);
    return district ? district.name : "";
  };

  const getWardName = (wardId) => {
    const ward = wards.find((w) => w.id === wardId);
    return ward ? ward.name : "";
  };

  const fullAddress = () => {
    const addressParts = [
      address, 
      wards, 
      districts,
      provinces
    ].filter(Boolean);

    if (addressParts.length === 1 && getProvinceName(selectedProvince)) {
      return getProvinceName(selectedProvince);
    }

    return addressParts.join(", ");
  };

  return (
    <>
      <Header />
      <div style={{ paddingTop: "100px" }} className="profile-container">
        <div className="profile-card">
          <img src={image} alt="Avatar" className="profile-avatar" />
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
                <td>{user.gender || ""}</td>
              </tr>

              <tr>
                <td>Address</td>
                <td>{fullAddress()}</td>
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
