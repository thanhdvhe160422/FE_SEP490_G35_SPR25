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
import Swal from "sweetalert2";

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
  const [errors, setErrors] = useState();

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
        if (data.data.avatar) {
          setImage(
            data?.data?.avatar?.mediaUrl || localStorage.getItem("avatar")
          );
        }
        setName(data.data.firstName + " " + data.data.lastName);
        if (data.data && data.data.addressVM) {
          setSelectedProvince(
            data.data?.addressVM?.wardVM?.districtVM?.provinceVM.id || ""
          );
          setSelectedDistrict(
            data.data?.addressVM?.wardVM?.districtVM.id || ""
          );
          setSelectedWard(data.data?.addressVM?.wardVM?.id || "");
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu người dùng:", error);
        setLoading(false);
      }
    };

    fetchProvinces();
    fetchUserData();
  }, []);

  const fetchProvinces = async () => {
    try {
      const data = await getProvinces();
      setProvinces(data.data.result || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách tỉnh:", error);
      setProvinces([]);
    }
  };

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

  const fetchWards = async () => {
    try {
      //console.log("selected district: " + selectedDistrict);
      const data = await getWards(selectedDistrict);
      setWards(data.data.result || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách phường/xã:", error);
      setWards([]);
    }
  };
  useEffect(() => {
    //console.log("user change data: " + JSON.stringify(user, null, 2));
  }, [user]);

  useEffect(() => {
    if (!selectedProvince) return;
    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) return;
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
      if (
        validateNameField(user.firstName) !== "" ||
        validateNameField(user.lastName) !== "" ||
        validateDateOfBirth(user.dateOfBirth) !== "" ||
        validateAddress(user?.addressVM?.addressDetail) !== "" ||
        validatePhoneField(user.phoneNumber) !== "" ||
        selectedWard === ""
      ) {
        Swal.fire({
          title: "Error",
          text: "Nhập đúng dữ liệu hợp lệ",
          icon: "error",
          timer: 2000,
        });
        return;
      }
      const updatedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        addressId: user.addressId,
        avatarId: user.avatarId,
        gender: user.gender + "" === "true",
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

      if (isChangeImage) {
        await handleSaveAvatar(file);
        setIsChangeImage(false);
      }
      const response = await updateProfile(updatedUser, token);

      if (response && response.status === 200) {
        enqueueSnackbar("Cập nhật hồ sơ thành công.", {
          variant: "success",
          autoHideDuration: 2000,
        });
        navigate("/profile");
      } else {
        enqueueSnackbar("Lỗi cập nhật hồ sơ.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      enqueueSnackbar(
        "Lỗi cập nhật: " + (error.response?.data?.message || error.message),
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
        enqueueSnackbar(
          "Lỗi định dạng ảnh. Vui lòng chọn định dạng JPG hoặc PNG",
          {
            variant: "error",
            autoHideDuration: 2000,
          }
        );
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Ảnh phải nhỏ hơn 5MB.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setIsChangeImage(true);
      setFile(file);
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

  const validateNameField = (value) => {
    const strValue = String(value || "").trim();
    if (!strValue) {
      return `Vui lòng nhập họ tên`;
    } else if (value.length > 30) {
      return `Không được vượt quá 30 ký tự.`;
    }
    return "";
  };
  const validatePhoneField = (value) => {
    const cleanedValue = String(value).replace(/\s/g, "");

    if (!/^\d+$/.test(cleanedValue)) {
      return "Số điện thoại chỉ được chứa chữ số";
    }

    if (cleanedValue.length !== 10) {
      return "Vui lòng nhập đúng 10 chữ số";
    }

    return "";
  };

  const validateAddress = (value) => {
    const strValue = String(value || "").trim();
    if (!strValue) return "Vui lòng nhập địa chỉ";
    if (value.length > 255) return "Địa chỉ không được vượt quá 255 ký tự";
    return "";
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    const error = validateNameField(value);
    setUser({ ...user, firstName: value.substring(0, 30) });
    setErrors({ ...errors, firstName: error });
  };
  const handleLastNameChange = (e) => {
    const value = e.target.value;
    const error = validateNameField(value);
    setUser({ ...user, lastName: value.substring(0, 30) });
    setErrors({ ...errors, lastName: error });
  };
  const validateDateOfBirth = (value) => {
    if (!value) return "Vui lòng nhập ngày sinh";
    if (new Date(value) > new Date()) return "Ngày sinh không được ở tương lai";
    return "";
  };
  const HandlePhoneNumber = (e) => {
    const value = e.target.value;
    const error = validatePhoneField(value);
    setUser({ ...user, phoneNumber: value.substring(0, 10) });
    setErrors({ ...errors, phone: error });
  };
  const HandleAddress = (e) => {
    const value = e.target.value;
    const error = validateAddress(value);
    setUser({
      ...user,
      addressVM: {
        ...(user.addressVM || {}),
        addressDetail: value.substring(0, 255),
      },
    });
    setErrors({ ...errors, address: error });
  };

  function convertToDirectLink(googleDriveUrl) {
    if (!googleDriveUrl.includes("drive.google.com/uc?id="))
      return googleDriveUrl;
    const fileId = googleDriveUrl.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  if (loading)
    return (
      <div className="loader">
        <Loading></Loading>
      </div>
    );
  if (!user) return <p>No user data found</p>;

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

          <div className="file-input-container">
            <button
              type="button"
              className="file-input-button"
              onClick={() => document.getElementById("avatar-upload").click()}
            >
              Đổi ảnh
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
          <h2>Cập nhật hồ sơ</h2>
          <form>
            <div className="input-group">
              <div className="input-field">
                <label>Họ</label>
                <input
                  className="input-profile"
                  type="text"
                  value={user.firstName}
                  onChange={handleFirstNameChange}
                  maxLength="30"
                />
                {errors?.firstName && (
                  <div className="text-danger">{errors?.firstName}</div>
                )}
              </div>

              <div className="input-field">
                <label>Tên</label>
                <input
                  className="input-profile"
                  type="text"
                  value={user.lastName}
                  onChange={handleLastNameChange}
                  maxLength="30"
                />
                {errors?.lastName && (
                  <div className="text-danger">{errors?.lastName}</div>
                )}
              </div>

              <div className="input-field">
                <label>Ngày sinh</label>
                <input
                  className="input-profile"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={user.dateOfBirth ? user.dateOfBirth.split("T")[0] : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUser({ ...user, dateOfBirth: value });
                    setErrors({
                      ...errors,
                      dateOfBirth: validateDateOfBirth(value),
                    });
                  }}
                />
                {errors?.dateOfBirth && (
                  <div className="text-danger">{errors?.dateOfBirth}</div>
                )}
              </div>

              <div className="input-field">
                <label>Giới tính</label>
                <div className="gender-radio">
                  <label style={{ marginRight: "10%" }}>
                    <input
                      type="radio"
                      name="gender"
                      value="true"
                      checked={user.gender + "" === "true"}
                      onChange={(e) =>
                        setUser({ ...user, gender: e.target.value })
                      }
                    />
                    Nam
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="false"
                      checked={user.gender + "" === "false"}
                      onChange={(e) =>
                        setUser({ ...user, gender: e.target.value })
                      }
                    />
                    Nữ
                  </label>
                </div>
              </div>
            </div>

            <div className="address-group">
              <div className="address-field">
                <label>Tỉnh</label>
                <select
                  className="input-profile"
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict("");
                  }}
                >
                  <option value="">-- Chọn tỉnh --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.provinceName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="address-field">
                <label>Huyện</label>
                <select
                  className="input-profile"
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedWard("");
                  }}
                >
                  <option value="">-- Chọn huyện --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="address-field">
                <label>Xã</label>
                <select
                  className="input-profile"
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                >
                  <option value="">-- Chọn xã --</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.wardName}
                    </option>
                  ))}
                </select>
                {selectedWard === "" && (
                  <div className="text-danger">Chọn nơi ở</div>
                )}
              </div>
            </div>
            <div className="input-field">
              <label>Địa chỉ</label>
              <input
                className="input-profile"
                type="text"
                value={user?.addressVM?.addressDetail || ""}
                onChange={HandleAddress}
                maxLength="255"
              />
              {errors?.address && (
                <div className="text-danger">{errors?.address}</div>
              )}
            </div>

            <div className="input-field">
              <label>Số điện thoại</label>
              <input
                className="input-profile"
                type="text"
                value={user.phoneNumber}
                onChange={HandlePhoneNumber}
                maxLength={10}
              />
              {errors?.phone && (
                <div className="text-danger">{errors.phone}</div>
              )}
            </div>
          </form>

          <div className="button-group">
            <button className="btn btn-danger" onClick={handleCancel}>
              Hủy
            </button>
            <button className="btn btn-success" onClick={handleUpdate}>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProfile;
