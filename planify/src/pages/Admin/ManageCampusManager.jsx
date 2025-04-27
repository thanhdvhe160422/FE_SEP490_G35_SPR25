import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getCampuses } from "../../services/campusService";
import {
  createCampusManager,
  getListManager,
  updateCampusManager,
} from "../../services/userService";
import { useSnackbar } from "notistack";
import { Modal, Button, Table } from "antd";
import "../../styles/Author/CreateEOG.css";
import { DeleteOutlined } from "@ant-design/icons";
import { CiLogout } from "react-icons/ci";
import { FaEdit, FaHome, FaLock, FaUsers } from "react-icons/fa";

export default function ManageCampusManager() {
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
    const fetchCampuses = async () => {
      const campusData = await getCampuses();
      setCampuses(campusData);
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [pagination.currentPage]);

  const fetchManagers = async () => {
    try {
      const response = await getListManager(
        pagination.currentPage,
        pagination.pageSize
      );
      console.log("Fetched Campus Manager: ", response.items);
      setCampusManagers(response.items);
      setPagination({
        ...pagination,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Error fetching Campus Manager:", error);
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
      enqueueSnackbar("Không tìm thấy token. Hãy đăng nhập lại.", {
        variant: "error",
      });
      return;
    }

    if (checkEmailExists(data.email)) {
      enqueueSnackbar("Email đã tồn tại!", { variant: "error" });
      return;
    }

    try {
      data.id = "00000000-0000-0000-0000-000000000000";
      data.gender = data.gender === "true";

      if (!data.campusId || data.campusId === 0) {
        enqueueSnackbar("Lỗi chưa chọn campus", {
          variant: "error",
        });
        return;
      }
      const response = await createCampusManager(data);
      console.log("response: " + JSON.stringify(response, null, 2));
      if (response.status !== 201) {
        enqueueSnackbar("Lỗi khi tạo Campus Manager!", {
          variant: "error",
        });
        return;
      }
      if (response?.message === "Email exists!") {
        enqueueSnackbar("Email đã tồn tại!", {
          variant: "error",
        });
        return;
      }
      enqueueSnackbar("Tạo Campus Manager thành công!", {
        variant: "success",
      });
      reset();
      setIsCreateModalVisible(false);
      fetchManagers();
    } catch (error) {
      enqueueSnackbar("Lỗi khi tạo Campus Manager!", { variant: "error" });
    }
  };

  const handleDelete = (eog) => {
    setSelectedEOG(eog);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedEOG?.id) {
        throw new Error("No Campus Manager selected for deletion");
      }

      const response = await updateCampusManager(selectedEOG.id);
      if (response.status !== 200) {
        enqueueSnackbar("Lỗi khi xóa Campus Manager!", {
          variant: "error",
        });
      }

      enqueueSnackbar("Xóa thành công Campus Manager!", {
        variant: "success",
      });
      setIsDeleteModalVisible(false);
      fetchManagers();
    } catch (error) {
      console.error("Error deleting Campus Manager:", error);
      enqueueSnackbar("Lỗi khi xóa Campus Manager!", { variant: "error" });
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
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) =>
        (pagination.currentPage - 1) * pagination.pageSize + index + 1,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Họ Tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Campus",
      dataIndex: "campusName",
      key: "campusName",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (text ? "Male" : "Female"),
    },
    { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber" },
  ];
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
  const handleLogout = () => {
    localStorage.clear();
  };

  return (
    <div className="page-flex">
      <aside
        class="sidebar"
        style={{ width: "350px", position: "fixed", top: "0px" }}
      >
        <div class="sidebar-start">
          <div class="sidebar-head">
            <a href="/dashboard" class="logo-wrapper" title="Home">
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
                <a className="show-cat-btn" href="/manage-user">
                  <FaUsers style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý người dùng
                </a>
              </li>
              <li>
                <a className="active" href="manage-campus-manager">
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
                <a href="/manage-campus">
                  <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý Campus
                </a>
              </li>
              <li>
                <a href="loginadmin" onClick={handleLogout}>
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
      <div
        className="create-organizer-container"
        style={{ marginLeft: "350px" }}
      >
        <Modal
          title="Tạo Campus Manager"
          visible={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="organizer-form">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email không được để trống",
                  maxLength: { value: 255, message: "Tối đa 255 ký tự" },
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Định dạng email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <span className="error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Họ:</label>
              <input
                type="text"
                maxLength={30}
                {...register("firstName", {
                  required: "Họ không được để trống",
                  pattern: {
                    value: /^[A-Za-zÀ-ỹà-ỹĐđ\s]+$/,
                    message: "Không được nhập số hoặc ký tự đặc biệt trong Tên",
                  },
                  maxLength: { value: 30, message: "Tối đa 30 ký tự" },
                })}
              />
              {errors.firstName && (
                <span className="error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Tên:</label>
              <input
                type="text"
                maxLength={30}
                {...register("lastName", {
                  required: "Tên không được để trống",
                  pattern: {
                    value: /^[A-Za-zÀ-ỹà-ỹĐđ\s]+$/,
                    message: "Không được nhập số hoặc ký tự đặc biệt trong Họ",
                  },
                  maxLength: { value: 30, message: "Tối đa 30 ký tự" },
                })}
              />
              {errors.lastName && (
                <span className="error">{errors.lastName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Ngày sinh:</label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...register("dateOfBirth", {
                  required: "Ngày sinh không được để trống",
                  validate: (value) => {
                    const dob = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - dob.getFullYear();
                    return age >= 18 || "Bạn phải ít nhất 18 tuổi";
                  },
                })}
              />
              {errors.dateOfBirth && (
                <span className="error">{errors.dateOfBirth.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Giới tính:</label>
              <select {...register("gender")}>
                <option value={true}>Nam</option>
                <option value={false}>Nữ</option>
              </select>
            </div>

            <div className="form-group">
              <label>SĐT:</label>
              <input
                type="text"
                onInput={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  e.target.value = onlyNums.slice(0, 10);
                }}
                {...register("phoneNumber", {
                  required: "Số điện thoại không được để trống",
                  pattern: {
                    value: /^0\d{9}$/,
                    message: "Số điện thoại phải có 10 số và bắt đầu bằng 0",
                  },
                })}
              />
              {errors.phoneNumber && (
                <span className="error">{errors.phoneNumber.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Campus:</label>
              <select
                {...register("campusId", {
                  validate: (value) => value !== "0" || "Vui lòng chọn campus",
                })}
              >
                <option value="0">Chọn Campus</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.campusName}
                  </option>
                ))}
              </select>
              {errors.campusId && (
                <span className="error">{errors.campusId.message}</span>
              )}
            </div>

            <div className="form-group">
              <button type="submit" className="submit-btn">
                Tạo
              </button>
            </div>
          </form>
        </Modal>

        <div className="eog-table-container">
          <h2>Danh sách Campus Manager</h2>{" "}
          <Button
            className="create-btn"
            onClick={() => setIsCreateModalVisible(true)}
          >
            Tạo Campus Manager
          </Button>
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
          title="Xác nhận xóa"
          visible={isDeleteModalVisible}
          onOk={confirmDelete}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <p>Bạn có chắc muốn xóa {selectedEOG?.email} không?</p>
        </Modal>
      </div>
    </div>
  );
}
