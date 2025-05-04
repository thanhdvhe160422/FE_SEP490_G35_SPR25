import React, { useEffect, useState } from "react";
import { getCampuses } from "../../services/campusService";
import { CiLogout } from "react-icons/ci";
import { FaEdit, FaHome, FaLock, FaUsers } from "react-icons/fa";
import "../../styles/Admin/manageCampus.css";
import { Button, Modal, Table } from "antd";
import axios from "axios";
import { useSnackbar } from "notistack";
import logo from "../../assets/logo-fptu.png";

function ManageCampus(props) {
  const token = localStorage.getItem("token");
  const [campuses, setCampuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCampusName, setNewCampusName] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const fetchCampuses = async () => {
    setIsLoading(true);
    try {
      const data = await getCampuses();
      setCampuses(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách campus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);
  const handleLogout = () => {
    localStorage.clear();
  };
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fptu-planify.com" + "/css/style.min.css";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "https://fptu-planify.com" + "/css/style.css";
    document.head.appendChild(link2);

    if (window.feather) {
      window.feather.replace();
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);
  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await axios.put(`https://fptu-planify.com/api/Campus/delete/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCampuses();
      // Sau khi xóa thành công, có thể cập nhật lại danh sách
      setCampuses((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa campus:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: "Tên Campus",
      dataIndex: "campusName",
      key: "campusName",
    },
    {
      title: "Hành động",
      render: (text, record) => (
        <span>
          <Button onClick={() => handleDelete(record.id)} danger>
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="manage-campus-container">
      <aside
        class="sidebar"
        style={{ width: "350px", position: "fixed", top: "0" }}
      >
        <div class="sidebar-start">
          <div class="sidebar-head">
            <a href="/dashboard" class="logo-wrapper" title="Home">
              <img src={logo} alt="" style={{width: "150px"}}/>
              <span class="sr-only">Home</span>
              <span class="icon logo" aria-hidden="true"></span>
              <div class="logo-text">
                <span class="logo-title">Planify</span>
                <span class="logo-subtitle">Dashboard</span>
              </div>
            </a>
          </div>
          <div class="sidebar-body">
            <ul className="sidebar-body-menu">
              <li>
                <a href="/dashboard">
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
                <a href="manage-campus-manager">
                  <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý Campus Manager
                </a>
              </li>
              <li>
                <a href="/change-password">
                  <FaLock style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Đổi mật khẩu
                </a>
              </li>
              <li>
                <a className="active" href="/manage-campus">
                  <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý Campus
                </a>
              </li>
              <li>
                <a href="/loginAdmin" onClick={handleLogout}>
                  <CiLogout style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Đăng xuất
                </a>
              </li>
              {/* <li>
                          <a className="show-cat-btn" href="#">
                            <FaThLarge style={{ marginRight: "10px", fontSize:'20px' }}  /> Extensions
                            <span
                              className="category__btn transparent-btn"
                              title="Open list"
                            >
                              <span className="sr-only">Open list</span>
                              <FaAngleDown />
                            </span>
                          </a>
                        </li> */}
              {/* <li>
                          <a href="#">
                            <CiLogout style={{ marginRight: "10px", fontSize:'30px', marginTop:'100%' }} /> Settings
                          </a>
                        </li> */}
            </ul>
            <ul className="sidebar-body-menu logout-section"></ul>
          </div>
        </div>
      </aside>
      <div className="campus-container">
        <h1>Quản lý Campus</h1>
        <button
          style={{
            border: "#ccc solid 1px",
            padding: "10px",
            margin: "20px 0",
            backgroundColor: "#fff",
            color: "#000",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => setIsModalVisible(true)}
        >
          Tạo Campus
        </button>

        <Table
          columns={columns}
          pagination={false}
          dataSource={campuses}
          rowKey="id"
        />
        <Modal
          title="Tạo Campus mới"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={async () => {
            try {
              await axios.post(
                "https://fptu-planify.com/api/Campus",
                { campusName: newCampusName, status: "1" },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setIsModalVisible(false);
              setNewCampusName("");
              fetchCampuses(); // gọi lại danh sách
            } catch (error) {
              if (error?.response?.data?.message === "Cơ sở đã tồn tại!")
                enqueueSnackbar("Campus đã tồn tại", {
                  variant: "error",
                  autoHideDuration: 3000,
                });
              console.error("Lỗi khi tạo campus:", error);
            }
          }}
          okText="Tạo"
          cancelText="Hủy"
        >
          <input
            value={newCampusName}
            onChange={(e) => setNewCampusName(e.target.value)}
            placeholder="Nhập tên campus"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
        </Modal>
      </div>
    </div>
  );
}

export default ManageCampus;
