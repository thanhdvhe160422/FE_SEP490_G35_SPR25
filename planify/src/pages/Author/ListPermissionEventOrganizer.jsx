import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCampuses } from "../../services/campusService";
import { getSpectatorAndImplementer, setEOG } from "../../services/userService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useSnackbar } from "notistack";
import { Button, Table } from "antd";
import "../../styles/Author/CreateEOG.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";

export default function ListPermissionEventOrganizer() {
  const [campuses, setCampuses] = useState([]);
  const [listUsers, setListUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchCampuses = async () => {
      const campusData = await getCampuses();
      setCampuses(campusData);
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await getSpectatorAndImplementer(
        pagination.currentPage,
        pagination.pageSize,
        ""
      );
      setListUsers(response.items);
      setPagination({
        ...pagination,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách:", error);
    }
  };

  const handleTableChange = (paginationData) => {
    setPagination({
      ...pagination,
      currentPage: paginationData.current,
      pageSize: paginationData.pageSize,
    });
  };

  const setRole = async (userId) => {
    try {
      const response = await setEOG(userId);
      if (response.status === 200) {
        enqueueSnackbar("Chuyển quyền thành event organizer thành công", {
          variant: "success",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      enqueueSnackbar("Có lỗi xảy ra!", {
        variant: "error",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
        autoHideDuration: 3000,
      });
      console.error("Lỗi khi đổi quyền:", error);
    }
  };
  const HandleSetEOG = async (user) => {
    if (!user) return;
    const userId = user.id;
    await setRole(userId);
    await fetchUsers();
  };
  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Tên", dataIndex: "firstName", key: "firstName" },
    { title: "Họ", dataIndex: "lastName", key: "lastName" },
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
          <Button className="btn" onClick={() => HandleSetEOG(record)}>
            Cấp quyền tạo sự kiện
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <Breadcrumb />
      <div style={{ padding: "20px" }} className="user-container">
        <div className="user-table-container">
          <h2>Danh sách người có thể cấp quyền</h2>
          <Table
            columns={columns}
            dataSource={listUsers}
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
      </div>
      {/* <Footer /> */}
    </>
  );
}
