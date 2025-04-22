import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCampuses } from "../../services/campusService";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "notistack";
import { toast } from "react-toastify";
import backgroundImage from "../../assets/fpt-campus.jpg";
import "../../styles/Author/Login.css";

export default function Login() {
  const [campus, setCampus] = useState("");
  const [campusList, setCampusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    localStorage.clear();
  }, []);
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const data = await getCampuses();
        setCampusList(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách campus:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampuses();
  }, []);

  const handleSuccess = async (response) => {
    try {
      const decoded = jwtDecode(response.credential);
      const { credential } = response;
      console.log(decoded.picture);

      const res = await axios.post(
        "https://localhost:44320/api/Auth/google-login",
        { CampusName: campus, GoogleToken: credential }
      );
      console.log("API Response:", res.data);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.result.accessToken}`;

      localStorage.setItem("fullName", res.data.result.fullName);
      localStorage.setItem("avatar", decoded.picture);
      localStorage.setItem("token", res.data.result.accessToken);
      localStorage.setItem("role", res.data.result.role);
      localStorage.setItem("campus", campus);
      localStorage.setItem("userId", res.data.result.userId);
      localStorage.setItem("reToken", res.data.result.refreshToken);

      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });

      setTimeout(() => {
        switch (res.data.result.role) {
          case "Campus Manager":
            navigate(`/home`);
            break;
          case "Event Organizer":
            navigate(`/home`);
            break;
          case "Implementer":
            navigate(`/home-implementer`);
            break;
          case "Spectator":
            navigate(`/home-spec`);
            break;
          default:
            navigate("/login");
            break;
        }
      }, 1000);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      enqueueSnackbar(
        "Tài khoản của bạn không được phép đăng nhập vào hệ thống.",
        {
          variant: "error",
        }
      );
    }
  };

  const handleError = () => {
    enqueueSnackbar("Google Login thất bại!", { variant: "error" });
  };

  return (
    <div
      className="login-container"
      style={{
        background: `url(${backgroundImage}) no-repeat center center/cover`,
      }}
    >
      <h1 className="university-title">FPT University</h1>
      <div className="login-box">
        <p className="login-title">Sinh viên, Giảng viên, Cán bộ ĐH-FPT</p>

        {loading ? (
          "Loading..."
        ) : (
          <select
            style={{ width: "230px", margin: "5px" }}
            className="campus-select"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
          >
            <option value="">Chọn Campus</option>
            {campusList.map((item) => (
              <option key={item.id} value={item.value}>
                {item.campusName}
              </option>
            ))}
          </select>
        )}

        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
}
