import React, { useEffect, useState } from "react";
import "../../styles/Profile.css";
import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import { FaRegEdit } from "react-icons/fa";

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await fetch("http://localhost:4000/users/2");
        const userData = await userRes.json();

        setUser(userData);
        setSelectedProvince(userData.provinceId || "");
        setSelectedDistrict(userData.districtId || "");
        setSelectedWard(userData.wardId || "");

        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu người dùng:", error);
        setLoading(false);
      }
    };

    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
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
        setWards([]); // Reset danh sách phường khi tỉnh thay đổi
        setSelectedDistrict(""); // Reset quận/huyện
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
        setSelectedWard(""); // Reset phường/xã khi quận thay đổi
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

      await fetch("http://localhost:4000/users/2", {
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
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`; // Chuyển sang YYYY-MM-DD
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <img src={user.avatar} alt="Avatar" className="profile-avatar" />
          <h2>
            {user.firstName} {user.lastName}
          </h2>
          <p className="profile-email">{user.email}</p>
          <button
            className="btn btn-info"
            style={{
              width: "70%",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => navigate("/editprofile")}
          >
            <FaRegEdit /> Update Profile
          </button>
        </div>

        <div className="profile-form">
          <h2>Profile Information</h2>
          <form>
            <div className="input-group">
              <div style={{ width: "100%" }}>
                <label>First Name</label>
                <input
                  readOnly
                  className="input-profile"
                  style={{ width: "40%", marginLeft: "43px" }}
                  type="text"
                  value={user.firstName}
                  onChange={(e) =>
                    setUser({ ...user, firstName: e.target.value })
                  }
                />
              </div>

              <div style={{ width: "100%" }}>
                <label>Last Name</label>
                <input
                  readOnly
                  className="input-profile"
                  style={{ width: "40%", marginLeft: "43px" }}
                  type="text"
                  value={user.lastName}
                  onChange={(e) =>
                    setUser({ ...user, lastName: e.target.value })
                  }
                />
              </div>

              <div style={{ width: "100%" }}>
                <label>Date of Birth</label>
                <input
                  readOnly
                  className="input-profile"
                  style={{ width: "40%", marginLeft: "30px" }}
                  type="date"
                  value={user.dateOfBirth ? formatDate(user.dateOfBirth) : ""}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      dateOfBirth: e.target.value
                        .split("-")
                        .reverse()
                        .join("-"),
                    })
                  }
                />
              </div>

              <div style={{ width: "100%" }}>
                <label>Phone Number</label>
                <input
                  readOnly
                  className="input-profile"
                  style={{ width: "40%", marginLeft: "10px" }}
                  type="text"
                  value={user.phoneNumber}
                  onChange={(e) =>
                    setUser({ ...user, phoneNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div style={{ width: "30%" }}>
                <label>Province</label>
                <select
                  disabled
                  className="input-profile"
                  style={{ margin: "20px 20px 15px 55px", width: "50%" }}
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: "30%" }}>
                <label>District</label>
                <select
                  disabled
                  className="input-profile"
                  style={{ margin: "20px 20px 15px 15px", width: "70%" }}
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: "25%" }}>
                <label>Ward</label>
                <select
                  disabled
                  className="input-profile"
                  style={{ margin: "20px 20px 15px 15px", width: "50%" }}
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>

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

export default EditProfile;
