import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getCampuses } from "../../services/campusService";
import {
  banUser,
  createCampusManager,
  getListUser,
  unbanUser,
} from "../../services/userService";
import { useSnackbar } from "notistack";
import { Modal, Button, Table } from "antd";
import "../../styles/Author/CreateEOG.css";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { CiLogout } from "react-icons/ci";
import { FaEdit, FaHome, FaUsers } from "react-icons/fa";

export default function ManageUser() {
  const [campuses, setCampuses] = useState([]);
  const [campusManagers, setCampusManagers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      campusId: 0,
      dateOfBirth: "",
      gender: true,
      phoneNumber: "",
    },
  });
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedEOG, setSelectedEOG] = useState(null);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "http://localhost:3000" + "/css/style.min.css";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "http://localhost:3000" + "/css/style.css";
    document.head.appendChild(link2);

    if (window.feather) {
      window.feather.replace();
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);
  useEffect(() => {
    const fetchCampuses = async () => {
      const campusData = await getCampuses();
      setCampuses(campusData);
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [pagination.currentPage]);

  const fetchUser = async () => {
    try {
      const response = await getListUser(
        pagination.currentPage,
        pagination.pageSize
      );
      console.log("Fetched Campus Manager: ", response.items);
      setCampusManagers(response.items || []); // Đảm bảo items luôn là mảng
      setPagination({
        ...pagination,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Error fetching Campus Manager:", error);
      setCampusManagers([]); // Đặt lại thành mảng rỗng nếu lỗi
    }
  };

  const checkEmailExists = (email, excludeId = null) => {
    return campusManagers.some(
      (eog) => eog.email === email && (!excludeId || eog.id !== excludeId)
    );
  };

  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      enqueueSnackbar("No token found. Please log in.", { variant: "error" });
      return;
    }

    if (checkEmailExists(data.email)) {
      enqueueSnackbar("Email already exists!", { variant: "error" });
      return;
    }

    try {
      await createCampusManager(data);
      enqueueSnackbar("Campus Manager created successfully!", {
        variant: "success",
      });
      reset();
      setIsCreateModalVisible(false);
      fetchUser();
    } catch (error) {
      enqueueSnackbar("Error creating Campus Manager!", { variant: "error" });
    }
  };

  const handleBan = (eog) => {
    setSelectedEOG(eog);
    setIsDeleteModalVisible(true);
  };

  const handleUnban = (eog) => {
    setSelectedEOG(eog);
    setIsDeleteModalVisible(true);
  };

  const confirmBan = async () => {
    try {
      if (!selectedEOG?.id) {
        throw new Error("No Campus Manager selected for banning");
      }
      await banUser(selectedEOG.id);
      enqueueSnackbar("User banned successfully!", { variant: "success" });
      setIsDeleteModalVisible(false);
      fetchUser();
    } catch (error) {
      console.error("Error banning user:", error);
      enqueueSnackbar("Error banning user!", { variant: "error" });
    }
  };

  const confirmUnban = async () => {
    try {
      if (!selectedEOG?.id) {
        throw new Error("No Campus Manager selected for unbanning");
      }
      await unbanUser(selectedEOG.id, 1);
      enqueueSnackbar("User unbanned successfully!", { variant: "success" });
      setIsDeleteModalVisible(false);
      fetchUser();
    } catch (error) {
      console.error("Error unbanning user:", error);
      enqueueSnackbar("Error unbanning user!", { variant: "error" });
    }
  };

  const handleTableChange = (paginationData) => {
    setPagination({
      ...pagination,
      currentPage: paginationData.current,
      pageSize: paginationData.pageSize,
    });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (text ? "Male" : "Female"),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text) => (text ? "Manager" : "User"),
    },
    { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div>
          {record.status === 1 ? (
            <Button
              icon={<LockOutlined />}
              type="link"
              danger
              onClick={() => handleBan(record)}
            >
              Ban
            </Button>
          ) : (
            <Button
              icon={<UnlockOutlined />}
              type="link"
              onClick={() => handleUnban(record)}
            >
              Unban
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div class="page-flex">
        <aside class="sidebar" style={{ width: "400px" }}>
          <div class="sidebar-start">
            <div class="sidebar-head">
              <a href="/" class="logo-wrapper" title="Home">
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
                  <a className="show-cat-btn" href="/dashboard">
                    <FaHome style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                    Dashboard
                  </a>
                </li>
                <li>
                  <a className="active" href="/manage-user">
                    <FaUsers
                      style={{ marginRight: "10px", fontSize: "20px" }}
                    />{" "}
                    Danh sách users
                  </a>
                </li>
                <li>
                  <a href="manage-campus-manager">
                    <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                    Quản lý Campus Manager
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
              <ul className="sidebar-body-menu logout-section">
                <li>
                  <a href="#">
                    <CiLogout
                      style={{ marginRight: "10px", fontSize: "40px" }}
                    />{" "}
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <div className="create-organizer-container">
          <div className="eog-table-container">
            <h2>List Users ({pagination.totalCount})</h2>
            <Table
              columns={columns}
              dataSource={campusManagers}
              rowKey="id"
              pagination={{
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
                total: pagination.totalCount,
                totalPages: pagination.totalPages,
                onChange: (page, pageSize) =>
                  handleTableChange({ current: page, pageSize }),
              }}
            />
          </div>

          <Modal
            title={selectedEOG?.status === 1 ? "Confirm Ban" : "Confirm Unban"}
            visible={isDeleteModalVisible}
            onOk={selectedEOG?.status === 1 ? confirmBan : confirmUnban}
            onCancel={() => setIsDeleteModalVisible(false)}
            okText={selectedEOG?.status === 1 ? "Ban" : "Unban"}
            cancelText="Cancel"
            okButtonProps={{ danger: selectedEOG?.status === 1 }}
          >
            <p>
              Are you sure you want to{" "}
              {selectedEOG?.status === 1 ? "ban" : "unban"} {selectedEOG?.email}
              ?
            </p>
          </Modal>
        </div>
      </div>
    </>
  );
}
