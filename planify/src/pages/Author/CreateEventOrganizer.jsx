import React, { useState, useEffect } from "react";
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
    fetchEOGs();
  }, [pagination.currentPage]);

  const fetchEOGs = async () => {
    try {
      const response = await getListEOG(
        pagination.currentPage,
        pagination.pageSize
      );
      console.log("Fetched Event Organizers: ", response.items);
      setEventOrganizers(response.items);
    } catch (error) {
      console.error("Error fetching Event Organizers:", error);
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
      enqueueSnackbar("No token found. Please log in.", { variant: "error" });
      return;
    }

    if (checkEmailExists(data.email)) {
      enqueueSnackbar("Email already exists!", { variant: "error" });
      return;
    }

    try {
      await createEventOrganizer(data);
      enqueueSnackbar("Event Organizer created successfully!", {
        variant: "success",
      });
      reset();
      setIsCreateModalVisible(false);
      fetchEOGs();
    } catch (error) {
      enqueueSnackbar("Error creating Event Organizer!", { variant: "error" });
    }
  };

  const handleDelete = (eog) => {
    setSelectedEOG(eog);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedEOG?.id) {
        throw new Error("No Event Organizer selected for deletion");
      }

      await updateEventOrganizer(selectedEOG.id);

      enqueueSnackbar("Event Organizer deleted successfully!", {
        variant: "success",
      });
      setIsDeleteModalVisible(false);
      fetchEOGs();
    } catch (error) {
      console.error("Error deleting Event Organizer:", error);
      enqueueSnackbar("Error deleting Event Organizer!", { variant: "error" });
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
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (text ? "Male" : "Female"),
    },
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Actions",
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
      <div className="create-organizer-container">
        <Modal
          title="Create Event Organizer"
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
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <span className="error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                {...register("firstName", {
                  required: "First Name is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "First Name can only contain letters and spaces",
                  },
                  maxLength: { value: 50, message: "Max 50 characters" },
                })}
              />
              {errors.firstName && (
                <span className="error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                {...register("lastName", {
                  required: "Last Name is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Last Name can only contain letters and spaces",
                  },
                  maxLength: { value: 50, message: "Max 50 characters" },
                })}
              />
              {errors.lastName && (
                <span className="error">{errors.lastName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                {...register("dateOfBirth", {
                  required: "Date of Birth is required",
                  validate: (value) => {
                    const dob = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - dob.getFullYear();
                    return age >= 18 || "You must be at least 18 years old";
                  },
                })}
              />
              {errors.dateOfBirth && (
                <span className="error">{errors.dateOfBirth.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Gender:</label>
              <select {...register("gender")}>
                <option value={true}>Male</option>
                <option value={false}>Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                {...register("phoneNumber", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^0\d{9,10}$/,
                    message:
                      "Phone Number must be 10-11 digits starting with 0",
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
                  validate: (value) =>
                    value !== "0" || "Please select a campus",
                })}
              >
                <option value="0">Select Campus</option>
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
                Create
              </button>
            </div>
          </form>
        </Modal>

        <div className="eog-table-container">
          <h2>Event Organizers List</h2>{" "}
          <Button
            className="create-btn"
            onClick={() => setIsCreateModalVisible(true)}
          >
            Create Event Organizer
          </Button>
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
          title="Confirm Delete"
          visible={isDeleteModalVisible}
          onOk={confirmDelete}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to delete {selectedEOG?.email}?</p>
        </Modal>
      </div>
      <Footer />
    </>
  );
}
