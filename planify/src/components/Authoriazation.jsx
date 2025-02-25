import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import "../styles/Authorization.css";

export default function Authorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <FaExclamationTriangle size={80} color="#ff4444" />
      <h1 className="unauthorized-title">Bạn không có quyền truy cập</h1>
      <p className="unauthorized-text">
        Vui lòng kiểm tra lại tài khoản hoặc liên hệ quản trị viên.
      </p>
      <button
        className="unauthorized-button"
        onClick={() => navigate("/login")}
      >
        Quay lại trang chủ
      </button>
    </div>
  );
}
