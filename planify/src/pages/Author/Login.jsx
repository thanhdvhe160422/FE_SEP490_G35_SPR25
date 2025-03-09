import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCampuses } from "../../services/campusService";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useSnackbar } from "notistack";
import backgroundImage from "../../assets/fpt-campus.jpg";
import "../../styles/Author/Login.css";

export default function Login() {
  const [campus, setCampus] = useState("");
  const [campusList, setCampusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

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
      const res = await axios.post("http://localhost:4000/auth/google", {
        GoogleToken: response.credential,
        CampusName: campus,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("campus", campus);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;

      enqueueSnackbar("Login successfully!", {
        variant: "success",
        autoHideDuration: 2500,
      });

      switch (res.data.role) {
        case "admin":
          navigate(`/admin?campus=${campus}`);
          break;
        case "manager_campus":
          navigate(`/managercampus?campus=${campus}`);
          break;
        case "event_organizer":
          navigate(`/eventorganizer?campus=${campus}`);
          break;
        case "implementer":
          navigate(`/implementer?campus=${campus}`);
          break;
        case "spectator":
          navigate(`/spectator?campus=${campus}`);
          break;
        default:
          navigate("/login");
          break;
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      enqueueSnackbar("Đăng nhập thất bại!", { variant: "error" });
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
        <p className="login-title">
          Students, Lecturers, University Staff of FPT
        </p>

        {loading ? (
          <p>Loading campus list...</p>
        ) : (
          <select
            className="campus-select"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
          >
            <option value="">Select Campus</option>
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
