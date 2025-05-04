import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button, Form, Input } from "antd";
import { FaEdit, FaHome, FaLock, FaUsers } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import "../../styles/Author/CreateEOG.css";
import logo from "../../assets/logo-fptu.png";

// CSS tùy chỉnh cho form đổi mật khẩu
const customStyles = `
  .content-container {
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    margin: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    align-self: center;
  }

  .content-container h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
    font-weight: 600;
  }

  .change-password-form .ant-form-item-label > label {
    font-weight: 500;
    color: #333;
  }

  .change-password-form .ant-input-password {
    border-radius: 6px;
    padding: 8px 12px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  @media (max-width: 768px) {
    .content-container {
      margin: 10px;
      padding: 20px;
    }
  }
`;

const ChangePassword = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Thêm các file CSS giống ManageCampusManager
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "http://localhost:3000/css/style.min.css";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "http://localhost:3000/css/style.css";
    document.head.appendChild(link2);

    const styleSheet = document.createElement("style");
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    if (window.feather) {
      window.feather.replace();
    }

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(link2);
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/loginadmin");
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        enqueueSnackbar("Bạn cần đăng nhập để đổi mật khẩu.", {
          variant: "error",
        });
        navigate("/loginadmin");
        return;
      }

      const response = await fetch(
        "https://localhost:44320/api/Users/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        enqueueSnackbar(result.message || "Đổi mật khẩu thành công!", {
          variant: "success",
        });
        form.resetFields();
      } else {
        enqueueSnackbar(result.message || "Lỗi khi đổi mật khẩu.", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      enqueueSnackbar("Lỗi hệ thống. Vui lòng thử lại.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-flex">
      {/* Sidebar bên trái - Đồng bộ với ManageCampusManager */}
      <aside
        className="sidebar"
        style={{ width: "350px", position: "fixed", top: "0" }}
      >
        <div className="sidebar-start">
          <div class="sidebar-head">
            <a href="/dashboard" class="logo-wrapper" title="Home">
              <img src={logo} alt="" style={{ width: "150px" }} />
              <div class="logo-text">
                <span class="logo-title">Planify</span>
                <span class="logo-subtitle">Dashboard</span>
              </div>
            </a>
          </div>
          <div className="sidebar-body">
            <ul className="sidebar-body-menu">
              <li>
                <a className="show-cat-btn" href="/dashboard">
                  <FaHome style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Dashboard
                </a>
              </li>
              <li>
                <a className="show-cat-btn" href="/manage-user">
                  <FaUsers style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý người dùng
                </a>
              </li>
              <li>
                <a className="show-cat-btn" href="/manage-campus-manager">
                  <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý Campus Manager
                </a>
              </li>
              <li>
                <a className="active" href="/change-password">
                  <FaLock style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Đổi mật khẩu
                </a>
              </li>
              <li>
                <a href="/manage-campus">
                  <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý Campus
                </a>
              </li>
              <li>
                <a href="/loginadmin" onClick={handleLogout}>
                  <CiLogout style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Đăng xuất
                </a>
              </li>
            </ul>
            <ul className="sidebar-body-menu logout-section"></ul>
          </div>
        </div>
      </aside>

      {/* Nội dung chính */}
      <div
        className="create-organizer-container"
        style={{ marginLeft: "350px" }}
      >
        <div className="content-container">
          <h2>Đổi mật khẩu</h2>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleChangePassword}
            className="change-password-form"
          >
            <Form.Item
              label="Mật khẩu cũ"
              name="oldPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu cũ" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmNewPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>

            <div className="form-actions">
              <Button type="primary" htmlType="submit" loading={loading}>
                Đổi mật khẩu
              </Button>
              <Button onClick={() => form.resetFields()}>Hủy</Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
