import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spin } from "antd";
import "./ListParticipant.css";
import Typography from "antd/es/typography/Typography";
const { Title } = Typography;
function ListParticipant({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [numberOfParticipants, setNumberOfParticipants] = useState(0);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("vi", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (eventId) {
      fetchParticipants();
    }
  }, [eventId, currentPage]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://localhost:44320/api/Participant/count/${eventId}?pageNumber=${currentPage}&pageSize=10`
      );
      console.log("Response participants:", response.data.result);
      if (response.data.result) {
        setParticipants(response.data.result.participants);
        setTotalPages(response.data.result.totalPages);
        setNumberOfParticipants(response.data.result.totalParticipants);
      }
    } catch (err) {
      setError("Could not fetch participants");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa cột cho Table
  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
      width: 70,
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => text || "Unnamed",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "No email",
    },
    {
      title: "Thời gian đăng ký",
      dataIndex: "registrationTime",
      key: "registrationTime",
      render: (text) => formatDateTime(text) || "No registration time",
    },
  ];

  // Cấu hình phân trang cho Table
  const paginationConfig = {
    current: currentPage,
    pageSize: 10,
    total: numberOfParticipants,
    onChange: (page) => setCurrentPage(page),
    showSizeChanger: false, // Ẩn tùy chọn thay đổi pageSize
  };

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <div className="list-participant">
      <Title level={3} className="title">
        Danh sách người đăng ký sự kiện ({numberOfParticipants})
      </Title>
      <Spin spinning={loading}>
        {participants.length === 0 ? (
          <p className="no-participants">Không tìm thấy người tham gia</p>
        ) : (
          <Table
            columns={columns}
            dataSource={participants}
            rowKey="id"
            pagination={paginationConfig}
            className="participants-table"
          />
        )}
      </Spin>
    </div>
  );
}

export default ListParticipant;
