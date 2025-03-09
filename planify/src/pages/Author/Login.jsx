import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCampuses } from "../../services/campusService";
import { useNavigate } from "react-router-dom";
import "../../styles/Author/Login.css";
import backgroundImage from "../../assets/fpt-campus.jpg";
import { useSnackbar } from "notistack";

export default function Login() {
  const [campus, setCampus] = useState("");
  const [campusList, setCampusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

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

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initializeGoogleLogin;
      document.body.appendChild(script);
    } else {
      initializeGoogleLogin();
    }
  }, [CLIENT_ID]);

  const initializeGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      const { credential } = response;
      const res = await axios.post("http://localhost:4000/auth/google", {
        token: credential,
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
      alert("Đăng nhập thất bại!");
    }
  };

  const handleGoogleLogin = () => {
    // if (!campus) {
    //   enqueueSnackbar("Please select campus", {
    //     variant: "error",
    //     autoHideDuration: 2500,
    //   });
    //   return;
    // }
    if (window.google?.accounts) {
      window.google.accounts.id.prompt();
    } else {
      alert("Google Login chưa sẵn sàng. Vui lòng thử lại!");
    }
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

        <button className="login-btn google" onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google Logo"
            className="icon"
            style={{ width: "20px", height: "20px", marginRight: "10px" }}
          />
          Login with Google
        </button>
      </div>
    </div>
  );
}
