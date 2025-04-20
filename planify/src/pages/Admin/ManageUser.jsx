import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getCampuses } from "../../services/campusService";
import {
  banUser,
  createCampusManager,
  getListUser,
} from "../../services/userService";
import { useSnackbar } from "notistack";
import { Modal, Button, Table, Upload, message } from "antd";
import "../../styles/Author/CreateEOG.css";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { CiLogout } from "react-icons/ci";
import { FaEdit, FaHome, FaUsers, FaFileExcel } from "react-icons/fa";
import { searchUsers } from "../../services/adminService";
import * as XLSX from "xlsx";

export default function ManageUser() {
  const [campuses, setCampuses] = useState([]);
  const [campusManagers, setCampusManagers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
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
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedEOG, setSelectedEOG] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      enqueueSnackbar("Không tìm thấy token. Vui lòng đăng nhập.", {
        variant: "error",
      });
      navigate("/loginadmin");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        enqueueSnackbar("Token đã hết hạn. Vui lòng đăng nhập lại.", {
          variant: "error",
        });
        localStorage.removeItem("token");
        navigate("/loginadmin");
        return;
      }

      const userRole =
        decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
      if (userRole === "Admin") {
        setIsAdmin(true);
      } else {
        enqueueSnackbar("Bạn không có quyền truy cập trang này!", {
          variant: "error",
        });
        navigate("/loginadmin");
      }
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      enqueueSnackbar("Token không hợp lệ. Vui lòng đăng nhập lại.", {
        variant: "error",
      });
      localStorage.removeItem("token");
      navigate("/loginadmin");
    }
  }, [navigate, enqueueSnackbar]);

  // Load CSS and feather icons
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "http://localhost:3000/css/style.min.css";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "http://localhost:3000/css/style.css";
    document.head.appendChild(link2);

    if (window.feather) {
      window.feather.replace();
    }

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(link2);
    };
  }, []);

  // Fetch campuses
  useEffect(() => {
    const fetchCampuses = async () => {
      setLoadingCampuses(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const campusData = await getCampuses({ signal: controller.signal });
        clearTimeout(timeoutId);
        console.log("Danh sách campus:", campusData);
        if (!Array.isArray(campusData)) {
          enqueueSnackbar("Dữ liệu campus không hợp lệ", { variant: "error" });
          setCampuses([]);
          return;
        }
        setCampuses(campusData);
      } catch (error) {
        console.error("Lỗi khi lấy campus:", error.message);
        if (error.name === "AbortError") {
          enqueueSnackbar("Hết thời gian tải campus", { variant: "error" });
        } else {
          enqueueSnackbar(`Không tải được campus: ${error.message}`, {
            variant: "error",
          });
        }
      } finally {
        setLoadingCampuses(false);
      }
    };
    fetchCampuses();
  }, [enqueueSnackbar]);

  // Fetch users
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUser = async () => {
      try {
        const response = await getListUser(
          pagination.currentPage,
          pagination.pageSize
        );
        setCampusManagers(response.items || []);
        setPagination({
          ...pagination,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        });
      } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
        setCampusManagers([]);
        enqueueSnackbar("Không tải được danh sách user", { variant: "error" });
      }
    };
    fetchUser();
  }, [isAdmin, pagination.currentPage, pagination.pageSize, enqueueSnackbar]);

  const checkEmailExists = (email, excludeId = null) => {
    return campusManagers.some(
      (eog) => eog.email === email && (!excludeId || eog.id !== excludeId)
    );
  };

  const onSubmit = async (data) => {
    if (!isAdmin) {
      enqueueSnackbar("Bạn không có quyền thực hiện hành động này!", {
        variant: "error",
      });
      return;
    }

    if (checkEmailExists(data.email)) {
      enqueueSnackbar("Email đã tồn tại!", { variant: "error" });
      return;
    }

    try {
      await createCampusManager(data);
      enqueueSnackbar("Tạo Campus Manager thành công!", {
        variant: "success",
      });
      reset();
      setIsCreateModalVisible(false);
      fetchUser();
    } catch (error) {
      console.error("Lỗi khi tạo Campus Manager:", error);
      enqueueSnackbar("Lỗi khi tạo Campus Manager!", { variant: "error" });
    }
  };

  const handleBan = (eog) => {
    if (!isAdmin) {
      enqueueSnackbar("Bạn không có quyền thực hiện hành động này!", {
        variant: "error",
      });
      return;
    }
    setSelectedEOG(eog);
    setIsDeleteModalVisible(true);
  };

  const handleUnban = (eog) => {
    if (!isAdmin) {
      enqueueSnackbar("Bạn không có quyền thực hiện hành động này!", {
        variant: "error",
      });
      return;
    }
    setSelectedEOG(eog);
    setIsDeleteModalVisible(true);
  };

  const confirmBan = async () => {
    if (!isAdmin) {
      enqueueSnackbar("Bạn không có quyền thực hiện hành động này!", {
        variant: "error",
      });
      return;
    }

    try {
      if (!selectedEOG?.id) {
        throw new Error("Không có user được chọn để cấm");
      }
      await banUser(selectedEOG.id);
      enqueueSnackbar("Cấm user thành công!", { variant: "success" });
      setIsDeleteModalVisible(false);
      fetchUser();
    } catch (error) {
      console.error("Lỗi khi cấm user:", error);
      enqueueSnackbar("Lỗi khi cấm user!", { variant: "error" });
    }
  };

  const confirmUnban = async () => {
    if (!isAdmin) {
      enqueueSnackbar("Bạn không có quyền thực hiện hành động này!", {
        variant: "error",
      });
      return;
    }

    try {
      if (!selectedEOG?.id) {
        throw new Error("Không có user được chọn để bỏ cấm");
      }
      await banUser(selectedEOG.id);
      enqueueSnackbar("Bỏ cấm user thành công!", { variant: "success" });
      setIsDeleteModalVisible(false);
      fetchUser();
    } catch (error) {
      console.error("Lỗi khi bỏ cấm user:", error);
      enqueueSnackbar("Lỗi khi bỏ cấm user!", { variant: "error" });
    }
  };

  const handleTableChange = (paginationData) => {
    setPagination({
      ...pagination,
      currentPage: paginationData.current,
      pageSize: paginationData.pageSize,
    });
  };
  const fixDriveUrl = (url) => {
    if (!url) return null;
    if (url.includes("drive.google.com/uc?id=")) {
      const fileId = url.split("id=")[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      key: "index",
      render: (_, __, index) =>
        (pagination.currentPage - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Ảnh đại diện",
      dataIndex: "",
      key: "avatar",
      render: (text, record) => (
        <img
          src={fixDriveUrl(record.avatar.mediaUrl)}
          alt="avatar"
          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
        />
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Họ", dataIndex: "firstName", key: "firstName" },
    { title: "Tên", dataIndex: "lastName", key: "lastName" },
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
      render: (text) => (text ? "Nam" : "Nữ"),
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
    },
    { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          {record.status === 1 ? (
            <Button
              icon={<LockOutlined />}
              type="link"
              danger
              onClick={() => handleBan(record)}
            >
              Cấm
            </Button>
          ) : (
            <Button
              icon={<UnlockOutlined />}
              type="link"
              onClick={() => handleUnban(record)}
            >
              Bỏ cấm
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/loginadmin");
  };

  const getSearchUsers = async () => {
    if (!isAdmin) {
      enqueueSnackbar("Bạn không có quyền thực hiện hành động này!", {
        variant: "error",
      });
      return;
    }

    try {
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        input: searchInput,
      };
      const response = await searchUsers(params);
      if (response && response.items) {
        setCampusManagers(response.items);
        setPagination({
          currentPage: response.pageNumber,
          pageSize: response.pageSize,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        });
      } else {
        setCampusManagers([]);
        setPagination({
          ...pagination,
          currentPage: 1,
          totalCount: 0,
          totalPages: 1,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm user:", error);
      setCampusManagers([]);
      setPagination({
        ...pagination,
        currentPage: 1,
        totalCount: 0,
        totalPages: 1,
      });
      enqueueSnackbar("Không tìm kiếm được user", { variant: "error" });
    }
  };

  const handleImport = async () => {
    if (!isAdmin) {
      enqueueSnackbar("Bạn không có quyền thực hiện hành động này!", {
        variant: "error",
      });
      return;
    }

    if (!selectedCampusId) {
      enqueueSnackbar("Vui lòng chọn một campus!", { variant: "error" });
      return;
    }

    if (fileList.length === 0 || !fileList[0]?.originFileObj) {
      enqueueSnackbar("Vui lòng chọn một file Excel hợp lệ!", {
        variant: "error",
      });
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append("excelFile", fileList[0].originFileObj, fileList[0].name);

    console.log("FileList:", fileList);
    console.log("File name:", fileList[0].name);
    console.log("File size:", fileList[0].originFileObj.size);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:44320/api/Users/import?campusId=${selectedCampusId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        enqueueSnackbar(result.message || "Nhập users thành công!", {
          variant: "success",
        });
        setIsImportModalVisible(false);
        setFileList([]);
        setSelectedCampusId(null);
        fetchUser();
      } else {
        if (result.errors) {
          Object.values(result.errors)
            .flat()
            .forEach((error) => {
              enqueueSnackbar(error, { variant: "error" });
            });
        } else if (result.result && Array.isArray(result.result)) {
          result.result.forEach((error) => {
            enqueueSnackbar(error, { variant: "error" });
          });
        } else {
          enqueueSnackbar(result.message || "Lỗi khi nhập user!", {
            variant: "error",
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi nhập user:", error);
      enqueueSnackbar("Lỗi hệ thống khi nhập user. Vui lòng thử lại!", {
        variant: "error",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
      if (!isExcel) {
        message.error("Chỉ được tải lên file Excel (.xlsx hoặc .xls)!");
        return Upload.LIST_IGNORE;
      }
      if (file.size === 0) {
        message.error("File Excel không được rỗng!");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1));
    },
    fileList,
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        Email: "example@domain.com",
        FirstName: "Nguyen",
        LastName: "Van A",
        DateOfBirth: "15/03/2000",
        PhoneNumber: "0912345678",
        Gender: "Male",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    // Tạo workbook và thêm worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    // Xuất file Excel
    XLSX.writeFile(wb, "sample-users.xlsx");
  };
  const fetchUserByRole = async (role) => {
    try {
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        input: searchInput,
        roleName: role,
      };
      const response = await searchUsers(params);
      if (response && response.items) {
        setCampusManagers(response.items);
        setPagination({
          currentPage: response.pageNumber,
          pageSize: response.pageSize,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        });
      } else {
        setCampusManagers([]);
        setPagination({
          ...pagination,
          currentPage: 1,
          totalCount: 0,
          totalPages: 1,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm user:", error);
      setCampusManagers([]);
      setPagination({
        ...pagination,
        currentPage: 1,
        totalCount: 0,
        totalPages: 1,
      });
      enqueueSnackbar("Không tìm kiếm được user", { variant: "error" });
    }
  };

  const fetchUser = async () => {
    try {
      const response = await getListUser(
        pagination.currentPage,
        pagination.pageSize
      );
      setCampusManagers(response.items || []);
      setPagination({
        ...pagination,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      setCampusManagers([]);
      enqueueSnackbar("Không tải được danh sách user", { variant: "error" });
    }
  };
  const handleRowClick = (record) => {
    setSelectedUser(record);
    setIsOpenPopup(true);
  };

  return (
    <div className="page-flex">
      <aside className="sidebar" style={{ width: "350px" }}>
        <div className="sidebar-start">
          <div className="sidebar-head">
            <a href="/dashboard" className="logo-wrapper" title="Home">
              <span className="sr-only">Home</span>
              <span className="icon logo" aria-hidden="true"></span>
              <div className="logo-text">
                <span className="logo-title">Planify</span>
                <span className="logo-subtitle">Dashboard</span>
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
                <a className="active" href="/manage-user">
                  <FaUsers style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý người dùng
                </a>
              </li>
              <li>
                <a href="/manage-campus-manager">
                  <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Quản lý Campus Manager
                </a>
              </li>
              <li>
                <a href="/change-password">
                  <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Đổi mật khẩu
                </a>
              </li>
              <li>
                <a href="/loginadmin" onClick={handleLogout}>
                  <CiLogout style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <div className="create-organizer-container">
        <div className="eog-table-container">
          <div className="header-table">
            <h2>Danh sách người dùng ({pagination.totalCount})</h2>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                className="search"
                style={{
                  width: "400px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo email hoặc tên"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (e.target.value === "") {
                      fetchUser();
                    }
                  }}
                />
                <button className="btn btn-primary" onClick={getSearchUsers}>
                  Tìm kiếm
                </button>
              </div>
              <Button
                type="primary"
                icon={<FaFileExcel />}
                onClick={() => setIsImportModalVisible(true)}
              >
                Nhập Users
              </Button>
              <select
                name="roleName"
                id="roleName"
                onChange={(e) => fetchUserByRole(e.target.value)}
              >
                <option value="">Chọn vai trò</option>
                <option value="Admin">Admin</option>
                <option value="Campus Manager">Campus Manager</option>
                <option value="Event Organizer">Event Organizer</option>
                <option value="Implementer">Implementer</option>
                <option value="Spectator">Spectator</option>
              </select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={campusManagers}
            rowKey="id"
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              onChange: (page, pageSize) =>
                handleTableChange({ current: page, pageSize }),
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
          />
        </div>

        <Modal
          title={selectedEOG?.status === 1 ? "Xác nhận cấm" : "Xác nhận bỏ cấm"}
          visible={isDeleteModalVisible}
          onOk={selectedEOG?.status === 1 ? confirmBan : confirmUnban}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText={selectedEOG?.status === 1 ? "Cấm" : "Bỏ cấm"}
          cancelText="Hủy"
          okButtonProps={{ danger: selectedEOG?.status === 1 }}
        >
          <p>
            Bạn có chắc muốn {selectedEOG?.status === 1 ? "cấm" : "bỏ cấm"}{" "}
            {selectedEOG?.email}?
          </p>
        </Modal>
        <Modal
          title="Chi tiết người dùng"
          open={isOpenPopup}
          onCancel={() => {
            setIsOpenPopup(false);
            setSelectedUser(null);
          }}
          footer={[
            <Button key="close" onClick={() => setIsOpenPopup(false)}>
              Đóng
            </Button>,
          ]}
          className="detail-user-modal"
        >
          {selectedUser ? (
            <div style={{ padding: "10px 0" }}>
              <p>
                <strong>Ảnh đại diện:</strong>{" "}
                <img
                  src={fixDriveUrl(selectedUser.avatar?.mediaUrl)}
                  alt="avatar"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    marginTop: "8px",
                  }}
                />
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Họ:</strong> {selectedUser.firstName}
              </p>
              <p>
                <strong>Tên:</strong> {selectedUser.lastName}
              </p>
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {new Date(selectedUser.dateOfBirth).toLocaleDateString()}
              </p>
              <p>
                <strong>Giới tính:</strong> {selectedUser.gender ? "Nam" : "Nữ"}
              </p>
              <p>
                <strong>Vai trò:</strong> {selectedUser.roleName}
              </p>
              <p>
                <strong>SĐT:</strong> {selectedUser.phoneNumber}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedUser.status === 1 ? "Hoạt động" : "Bị cấm"}
              </p>
            </div>
          ) : (
            <p>Không có thông tin người dùng</p>
          )}
        </Modal>

        <Modal
          title="Nhập Users từ Excel"
          open={isImportModalVisible}
          onOk={handleImport}
          onCancel={() => {
            setIsImportModalVisible(false);
            setFileList([]);
            setSelectedCampusId(null);
          }}
          okText="Nhập"
          cancelText="Hủy"
          okButtonProps={{ loading: isImporting }}
          className="import-users-modal"
        >
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Chọn Campus:
            </label>
            {loadingCampuses ? (
              <p>Đang tải campus...</p>
            ) : campuses.length > 0 ? (
              <select
                value={selectedCampusId || ""}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="campus-select"
                disabled={loadingCampuses}
              >
                <option value="" disabled>
                  Chọn một campus
                </option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.campusName}
                  </option>
                ))}
              </select>
            ) : (
              <p>Không có campus nào</p>
            )}
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Tải lên file Excel:
            </label>
            <Upload {...uploadProps}>
              <Button icon={<FaFileExcel />}>Chọn file</Button>
            </Upload>
            {fileList.length > 0 && (
              <p style={{ marginTop: "10px" }}>
                File đã chọn: {fileList[0].name}
              </p>
            )}
            <Button
              type="link"
              icon={<FaFileExcel />}
              onClick={handleDownloadSample}
              style={{ marginTop: "10px" }}
            >
              Tải file mẫu
            </Button>
            <p style={{ marginTop: "10px", color: "#888" }}>
              Lưu ý: File Excel phải có các cột: Email, FirstName, LastName,
              DateOfBirth (dd/MM/yyyy hoặc yyyy-MM-dd, ví dụ: 15/03/2000),
              PhoneNumber (10 chữ số, bắt đầu bằng 03|05|07|08|09, ví dụ:
              0912345678), Gender (Male/Female).
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}
