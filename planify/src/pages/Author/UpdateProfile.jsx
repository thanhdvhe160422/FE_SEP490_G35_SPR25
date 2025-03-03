import React, { useEffect, useState } from "react";
import "../../styles/Author/UpdateProfile.css";
import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import { useSnackbar } from "notistack";

const UpdateProfile = () => {
  const [user, setUser] = useState(null);
  const [initialUser, setInitialUser] = useState(null); // Lưu trữ dữ liệu ban đầu
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [cardIdError, setCardIdError] = useState("");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await fetch("http://localhost:4000/users/2");
        const userData = await userRes.json();

        setUser(userData);
        setInitialUser(userData); // Lưu trữ dữ liệu ban đầu
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

  const validateCardId = (value) => {
    if (!/^\d*$/.test(value)) {
      setCardIdError("Please enter your ID number");
    } else if (value.length !== 12) {
      setCardIdError("Please enter 12 digits");
    } else {
      setCardIdError("");
    }
  };

  const hasChanges = () => {
    if (!initialUser || !user) return false;

    return (
      user.firstName !== initialUser.firstName ||
      user.lastName !== initialUser.lastName ||
      user.dateOfBirth !== initialUser.dateOfBirth ||
      user.gender !== initialUser.gender ||
      user.idCard !== initialUser.idCard ||
      user.address !== initialUser.address ||
      user.phoneNumber !== initialUser.phoneNumber ||
      selectedProvince !== initialUser.provinceId ||
      selectedDistrict !== initialUser.districtId ||
      selectedWard !== initialUser.wardId
    );
  };

  const handleUpdate = async () => {
    try {
      const updatedUser = {
        ...user,
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        wardId: selectedWard,
      };

      // Gọi API để cập nhật thông tin người dùng
      await fetch("http://localhost:4000/users/2", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      enqueueSnackbar("Update profile successfully", {
        variant: "success",
        autoHideDuration: 2500,
      });
      navigate("/profile");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user data found</p>;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`; 
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <img src={user.avatar} alt="Avatar" className="profile-avatar" />
          <div className="file-input-container">
            <button
              type="button"
              className="file-input-button"
              onClick={() => document.getElementById("avatar-upload").click()}
            >
              Choose File
            </button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <h2>
            {user.firstName} {user.lastName}
          </h2>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="profile-form">
          <h2>Update Profile Information</h2>
          <form>
            <div className="input-group">
              <div className="input-field">
                <label>First Name</label>
                <input
                  className="input-profile"
                  type="text"
                  value={user.firstName}
                  onChange={(e) =>
                    setUser({ ...user, firstName: e.target.value })
                  }
                />
              </div>

              <div className="input-field">
                <label>Last Name</label>
                <input
                  className="input-profile"
                  type="text"
                  value={user.lastName}
                  onChange={(e) =>
                    setUser({ ...user, lastName: e.target.value })
                  }
                />
              </div>

              <div className="input-field">
                <label>Date of Birth</label>
                <input
                  className="input-profile"
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

              <div className="input-field">
                <label>Gender</label>
                <div className="gender-radio">
                  <label style={{marginRight:'10%'}}>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={user.gender === "Male"}
                      onChange={(e) =>
                        setUser({ ...user, gender: e.target.value })
                      }
                    />
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={user.gender === "Female"}
                      onChange={(e) =>
                        setUser({ ...user, gender: e.target.value })
                      }
                    />
                    Female
                  </label>
                </div>
              </div>

              <div className="input-field">
                <label>ID Card</label>
                <input
                  style={{width:'49%'}}
                  className="input-profile"
                  type="text"
                  value={user.idCard || ""}
                  onChange={(e) => {
                    setUser({ ...user, idCard: e.target.value });
                    validateCardId(e.target.value);
                  }}
                />
                {cardIdError && <p style={{ color: 'red', marginTop: '5px' }}>{cardIdError}</p>}
              </div>
            </div>

            <div className="address-group">
              <div className="address-field">
                <label>Province</label>
                <select
                  className="input-profile"
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

              <div className="address-field">
                <label>District</label>
                <select
                  className="input-profile"
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

              <div className="address-field">
                <label>Ward</label>
                <select
                  className="input-profile"
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
            <div className="input-field">
                <label>Address</label>
                <input
                  className="input-profile"
                  type="text"
                  value={user.address || ""}
                  onChange={(e) =>
                    setUser({ ...user, address: e.target.value })
                  }
                />
              </div>

            <div className="input-field">
              <label>Phone Number</label>
              <input
                className="input-profile"
                type="text"
                value={user.phoneNumber}
                onChange={(e) =>
                  setUser({ ...user, phoneNumber: e.target.value })
                }
              />
            </div>
          </form>

          <div className="button-group">
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleUpdate}
              disabled={!hasChanges() || cardIdError !== ""}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProfile;