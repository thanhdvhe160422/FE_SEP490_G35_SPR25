import React, { useEffect, useState } from "react";
import "../../styles/Author/UpdateProfile.css";
import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import { useSnackbar } from "notistack";
import {
  updateProfile,
  updateAvatar,
  getProfileById,
} from "../../services/userService";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../../services/addressService";
// import "../../styles/Author/LoadingImage.css"
import Loading from "../../components/Loading";

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
  const [image, setImage] = useState("");
  const [isChangeImage, setIsChangeImage] = useState(false);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        setImage(localStorage.getItem("avatar"));
        const data = await getProfileById(userId, token);
        setUser(data.data);
        setInitialUser(data.data);
        if(data.data.avatar) {setImage(data?.data?.avatar?.mediaUrl||localStorage.getItem("avatar"))}
        setSelectedProvince(data.data.addressVM.wardVM.districtVM.provinceVM.id || 1);
        setSelectedDistrict(data.data.addressVM.wardVM.districtVM.id || 1);
        setSelectedWard(data.data.addressVM.wardVM.id || 1);
        setName(data.data.firstName+" "+data.data.lastName);

        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu người dùng:", error);
        setLoading(false);
      }
    };

    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data.data.result || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách tỉnh:", error);
        setProvinces([]);
      }
    };

    fetchProvinces();
    fetchUserData();
  }, []);
  useEffect(() => {
    console.log("Updated user state:", user);
  }, [user]);

  useEffect(() => {
    if (!selectedProvince) return;

    const fetchDistricts = async () => {
      try {
        const data = await getDistricts(selectedProvince);
        setDistricts(data.data.result || []);
        setWards([]);
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

        const data = await getWards(selectedDistrict)
        setWards(data.data .result|| []);
      } catch (error) {
        console.error("Lỗi lấy danh sách phường/xã:", error);
        setWards([]);
      }
    };

    fetchWards();
  }, [selectedDistrict]);

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
      selectedProvince !==
        initialUser.addressVM.wardVM.districtVM.provinceVM.Id ||
      selectedDistrict !== initialUser.addressVM.wardVM.districtVM.Id ||
      selectedWard !== initialUser.addressVM.wardVM.wardId
    );
  };

  const handleUpdate = async () => {
    try {
      const updatedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        addressId: user.addressId,
        avatarId: user.avatarId,
        gender: user.gender+""==='true',
        addressVM: {
          id: user.addressVM?.id || 0,
          addressDetail: user?.addressVM?.addressDetail || "",
          wardVM: {
            id: selectedWard || 0,
            wardName: "string",
            districtVM: {
              id: selectedDistrict || 0,
              districtName: "string",
              provinceVM: {
                id: selectedProvince || 0,
                provinceName: "string",
              },
            },
          },
        },
      };
      const parts = updatedUser.dateOfBirth.split("T")[0].split("-");
      const day = parts[2];
      const month = parts[1];
      const year = parts[0];
      const formattedDate = `${year}-${month}-${day}`;
      updatedUser.dateOfBirth = formattedDate;
      const token = localStorage.getItem("token");
      if (!token) {
        enqueueSnackbar("Please login again", {
          variant: "error",
          autoHideDuration: 2500,
        });
        navigate("/login");
        return;
      }

      if (isChangeImage){
        await handleSaveAvatar(file);
        setIsChangeImage(false);
      }
      const response = await updateProfile(updatedUser,token);

      if (response && response.status === 200) {
        enqueueSnackbar("Update profile successfully", {
          variant: "success",
          autoHideDuration: 2500,
        });
        navigate("/profile");
      } else {
        enqueueSnackbar("Failed to update profile", {
          variant: "error",
          autoHideDuration: 2500,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      enqueueSnackbar(
        "Error updating profile: " +
          (error.response?.data?.message || error.message),
        {
          variant: "error",
          autoHideDuration: 2500,
        }
      );
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG).");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size should be less than 5MB.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setIsChangeImage(true);
      setFile(file)
    }
  };

  const handleSaveAvatar = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("imageFile", file);

      const data = await updateAvatar(userId, formData, token);
      const url = data.data;

      console.log("Avatar updated successfully:", url);
      setImage(url);

      localStorage.setItem("avatar", url);

      setLoading(false); 
      return url;
    } catch (error) {
      console.error("Error updating avatar:", error);
      setLoading(false); 
      throw error;
    }
  };


  function convertToDirectLink(googleDriveUrl) {
    if (!googleDriveUrl.includes("drive.google.com/uc?id="))
      return googleDriveUrl;
    const fileId = googleDriveUrl.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}
  if (loading) return <div className="loader"><Loading></Loading></div>
  if (!user) return <p>No user data found</p>;

  return (
    <>
      <Header />
      <div style={{ paddingTop: "100px" }} className="profile-container">
        <div className="profile-card">
          <img
            src={convertToDirectLink(image)}
            alt="Avatar"
            className="profile-avatar"
          />

          <div className="file-input-container">
            <button
              type="button"
              className="file-input-button"
              onClick={() => document.getElementById("avatar-upload").click()}
            >
              Change Image
            </button>
            {/* <button className="btn" onClick={handleSaveAvatar}>
              Save Image
            </button> */}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <h2>
            {/* {user.firstName} {user.lastName} */}
            {name}
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
                  value={user.dateOfBirth ? user.dateOfBirth.split("T")[0] : ""}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-field">
                <label>Gender</label>
                <div className="gender-radio">
                  <label style={{ marginRight: "10%" }}>
                    <input
                      type="radio"
                      name="gender"
                      value="true"
                      checked={user.gender+"" === "true"}
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
                      value="false"
                      checked={user.gender+"" === "false"}
                      onChange={(e) =>
                        setUser({ ...user, gender: e.target.value })
                      }
                    />
                    Female
                  </label>
                </div>
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
                      {p.provinceName}
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
                      {d.districtName}
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
                      {w.wardName}
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
                value={user?.addressVM?.addressDetail || ""}
                onChange={(e) =>
                  setUser({
                    ...user,
                    addressVM: {
                      ...user.addressVM,
                      addressDetail: e.target.value,
                    },
                  })
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
            <button className="btn btn-success" onClick={handleUpdate}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProfile;
