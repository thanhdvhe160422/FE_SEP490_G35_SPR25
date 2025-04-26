import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getCampuses } from "../../services/campusService";
import {
  createEventOrganizer,
  getListEOG,
  updateEventOrganizer,
} from "../../services/userService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useSnackbar } from "notistack";
import { Modal, Button, Table } from "antd";
import "../../styles/Author/CreateEOG.css";
import { DeleteOutlined } from "@ant-design/icons";

export default function CreateEventOrganizer() {
  const [campuses, setCampuses] = useState([]);
  const [eventOrganizers, setEventOrganizers] = useState([]);
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
      id: "",
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampuses = async () => {
      const campusData = await getCampuses();
      setCampuses(campusData);
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    fetchEOGs();
  }, [pagination.currentPage]);

  const fetchEOGs = async () => {
    try {
      const response = await getListEOG(
        pagination.currentPage,
        pagination.pageSize
      );
      console.log("Danh sách người tổ chức sự kiện: ", response.items);
      setEventOrganizers(response?.items);
      setPagination({
        ...pagination,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người tổ chức sự kiện:", error);
    }
  };

  const checkEmailExists = (email, excludeId = null) => {
    return eventOrganizers.some(
      (eog) => eog.email === email && (!excludeId || eog.id !== excludeId)
    );
  };

  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      enqueueSnackbar("Không tìm thấy token. Vui lòng đăng nhập.", {
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

      const response = await createEventOrganizer(data);
      if (!response) {
        enqueueSnackbar("Lỗi khi tạo người tổ chức sự kiện!", {
          variant: "error",
        });
        return;
      }
      if (!response.message === "Email exists!") {
        enqueueSnackbar("Email đã tồn tại!", {
          variant: "error",
        });
        return;
      }
      enqueueSnackbar("Tạo người tổ chức sự kiện thành công!", {
        variant: "success",
      });
      reset();
      setIsCreateModalVisible(false);
      fetchEOGs();
    } catch (error) {
      enqueueSnackbar("Lỗi khi tạo người tổ chức sự kiện!", {
        variant: "error",
      });
    }
  };

  const handleDelete = (eog) => {
    setSelectedEOG(eog);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedEOG?.id) {
        throw new Error("Không có người tổ chức sự kiện nào được chọn để xóa");
      }

      const response = await updateEventOrganizer(selectedEOG.id);
      if (response === null) {
        enqueueSnackbar("Lỗi khi xóa người tổ chức sự kiện!", {
          variant: "error",
        });
      }
      enqueueSnackbar("Xóa người tổ chức sự kiện thành công!", {
        variant: "success",
      });
      setIsDeleteModalVisible(false);
      fetchEOGs();
    } catch (error) {
      console.error("Lỗi khi xóa người tổ chức sự kiện:", error);
      enqueueSnackbar("Lỗi khi xóa người tổ chức sự kiện!", {
        variant: "error",
      });
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
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Họ Tên",
      key: "fullName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (text ? "Nam" : "Nữ"),
    },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div>
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDelete(record)}
          ></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div
        style={{ marginTop: "100px" }}
        className="create-organizer-container"
      >
        <Modal
          title="Tạo người tổ chức sự kiện"
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
                  required: "Email là bắt buộc",
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
                onInput={(e) => {
                  e.target.value = e.target.value.slice(0, 30);
                }}
                {...register("firstName", {
                  required: "Họ là bắt buộc",
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
                onInput={(e) => {
                  e.target.value = e.target.value.slice(0, 30);
                }}
                {...register("lastName", {
                  required: "Tên là bắt buộc",
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
                  required: "Ngày sinh là bắt buộc",
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
              <label>Số điện thoại:</label>
              <input
                type="text"
                onInput={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  e.target.value = onlyNums.slice(0, 10);
                }}
                {...register("phoneNumber", {
                  required: "Số điện thoại là bắt buộc",
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
              <label>Cơ sở:</label>
              <select
                {...register("campusId", {
                  validate: (value) =>
                    value !== "0" || "Vui lòng chọn một cơ sở",
                })}
              >
                <option value="0">Chọn cơ sở</option>
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
          <h2>Danh sách người tổ chức sự kiện</h2>
          <div className="d-flex">
            <Button
              className="create-btn"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Tạo người tổ chức sự kiện
            </Button>
            <Button
              className="ms-2"
              onClick={() =>
                navigate("/manage-permission", {
                  state: { from: "manage-eog" },
                })
              }
            >
              Danh sách cấp quyền
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={eventOrganizers}
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
      <Footer />
    </>
  );
}
