import React, { useState } from "react";
import { Form, Button, Alert, InputGroup } from "react-bootstrap";
import "../../styles/Author/LoginAdmin.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import backgroundImage from "../../assets/fpt-campus.jpg";

const Login = () => {
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setShowAlert(false);
    setErrorMessage("");

    try {
      const response = await axios.post(
          "https://localhost:44320/api/Auth/admin-login",
          {
            username: inputUsername,
            password: inputPassword,
          },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "*/*",
            },
          }
      );

      const { status, message: responseMessage, result } = response.data;

      if (status === 200) {
        localStorage.setItem("token", result.accessToken);
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("fullName", result.fullName);
        localStorage.setItem("email", result.email);
        localStorage.setItem("role", result.role);
        localStorage.setItem("refreshToken", result.refreshToken);

        console.log("Đăng nhập thành công:", responseMessage);
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
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setShowAlert(true);
      setErrorMessage(
          error.response?.data?.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
      <div
          className="sign-in__wrapper"
          style={{
            background: `url(${backgroundImage}) no-repeat center center/cover`,
          }}
      >
        <h1 className="university-title">FPT University</h1>
        <div className="sign-in__backdrop"></div>
        <Form
            className="shadow p-4 bg-white rounded login-form"
            onSubmit={handleSubmit}
        >
          <h4 className="mb-4 text-center text-orange fw-bold">Admin Login</h4>
          {showAlert && (
              <Alert
                  className="mb-3"
                  variant="danger"
                  onClose={() => setShowAlert(false)}
                  dismissible
              >
                {errorMessage || "Thông tin đăng nhập không đúng!"}
              </Alert>
          )}
          <Form.Group className="mb-3" controlId="username">
            <Form.Label className="fw-semibold text-muted">Username</Form.Label>
            <Form.Control
                type="text"
                value={inputUsername}
                placeholder="Enter username"
                onChange={(e) => setInputUsername(e.target.value)}
                required
                className="rounded-pill"
            />
          </Form.Group>
          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="fw-semibold text-muted">Password</Form.Label>
            <InputGroup>
              <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={inputPassword}
                  placeholder="Enter password"
                  onChange={(e) => setInputPassword(e.target.value)}
                  required
                  className="rounded-pill rounded-end-0"
              />
              <InputGroup.Text
                  onClick={togglePasswordVisibility}
                  className="bg-white rounded-pill rounded-start-0 border-start-0 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
          <Button
              className="w-100 rounded-pill fw-semibold login-btn"
              variant="warning"
              type="submit"
              disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </Button>
        </Form>
      </div>
  );
};

export default Login;