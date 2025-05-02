import React, { useEffect, useState } from "react";
import {
  getMyRequest,
  searchMyRequest,
} from "../../services/EventRequestService";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router";
import { Table, Tag, Typography } from "antd";
import Swal from "sweetalert2";
import "../../styles/Events/MyRequest.css";

const { Text } = Typography;

function MyRequest(props) {
  const [requests, setRequests] = useState([]);
  const [tableProps, setTableProps] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
  });
  const [selectStatus, setSelectStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getMyRequest(userId);
      console.log("Fetched Requests: ", response.result);
      setRequests(response.result || []);
      setTableProps((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.total || response.result?.length || 0,
        },
      }));
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchRequest = async () => {
    setLoading(true);
    try {
      const response = await searchMyRequest(
        tableProps.pagination.current,
        tableProps.pagination.pageSize,
        selectStatus,
        userId
      );
      console.log("Fetched Search Requests: ", {
        status: selectStatus,
        items: response.items,
        total: response.total,
      });
      setRequests(response.items || []);
      setTableProps((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.totalPage || 0,
        },
      }));
    } catch (error) {
      console.error("Error fetching search requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectStatus === "") {
      fetchRequests();
    } else {
      fetchSearchRequest();
    }
  }, [
    selectStatus,
    tableProps.pagination.current,
    tableProps.pagination.pageSize,
  ]);

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Chưa được duyệt";
      case 2:
        return "Đã duyệt";
      case -1:
        return "Đã từ chối";
      default:
        return "Không xác định";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 2:
        return "green";
      case -1:
        return "red";
      case 1:
        return "orange";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => {
        const { current, pageSize } = tableProps.pagination;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Tiêu đề sự kiện",
      dataIndex: "eventTitle",
      key: "eventTitle",
      render: (text) => <Text strong>{text}</Text>,
    },

    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => (!reason || reason === "N/A" ? "Không có" : reason),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    setTableProps({ pagination });
  };

  const handleStatusChange = (e) => {
    setSelectStatus(e.target.value);
    setTableProps((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  return (
    <div
      className="event-request-page"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Header />
      <div className="event-request-content" style={{ padding: "20px" }}>
        <h2>Danh sách yêu cầu của tôi</h2>
        <select
          name="status"
          id="status"
          style={{ width: "200px", height: "32px", marginBottom: "10px" }}
          value={selectStatus}
          onChange={handleStatusChange}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Chưa duyệt</option>
          <option value="2">Đã duyệt</option>
          <option value="-1">Đã từ chối</option>
        </select>
        <Table
          columns={columns}
          dataSource={requests.map((req) => ({ ...req, key: req.id }))}
          pagination={tableProps.pagination}
          locale={{ emptyText: "Không có yêu cầu nào" }}
          rowClassName="event-request-row"
          loading={loading}
          onRow={(record) => ({
            onClick: () => {
              navigate(`/event-detail-EOG/${record.eventId}`, {
                state: { from: "my-request" },
              });
            },
          })}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString("vi", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default MyRequest;
