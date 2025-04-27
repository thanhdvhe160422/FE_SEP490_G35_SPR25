import React, { useEffect, useState } from "react";
import {
  getRequest,
  approveRequest,
  rejectRequest,
  searchRequest,
} from "../../services/EventRequestService";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router";
import { Table, Typography, Button } from "antd";
import Swal from "sweetalert2";
import "../../styles/Events/ManageRequest.css";
import Loading from "../../components/Loading";

const { Text } = Typography;

function ManageRequest() {
  const [requests, setRequests] = useState([]);
  const [tableProps, setTableProps] = useState({
    pagination: { current: 1, pageSize: 10 },
  });
  const [showPopupReject, setShowPopupReject] = useState(false);
  const [showPopupApprove, setShowPopupApprove] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveReason, setApproveReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectStatus, setSelectStatus] = useState("");
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getRequest();
      console.log("Fetched Requests: ", data);
      setRequests(data.result || []);
      setTableProps((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: data.total || data.result.length,
        },
      }));
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchRequest = async () => {
    setIsLoading(true);
    try {
      const response = await searchRequest(
        tableProps.pagination.current,
        tableProps.pagination.pageSize,
        selectStatus
      );
      console.log("Fetched Search Requests: ", {
        status: selectStatus,
        result: response.items,
        total: response.total,
      });
      setRequests(response.items || []);
      setTableProps((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.totalPages,
        },
      }));
    } catch (error) {
      console.error("Error fetching search requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
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

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowPopupApprove(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowPopupReject(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập lý do từ chối yêu cầu.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await rejectRequest(selectedRequest.id, rejectReason);
      if (selectStatus === "") {
        await fetchRequests();
      } else {
        await fetchSearchRequest();
      }
      setShowPopupReject(false);
      setRejectReason("");
      Swal.fire(
        "Từ chối thành công",
        "Yêu cầu đã được xử lý và từ chối thành công.",
        "success"
      );
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu:", error);
      Swal.fire(
        "Lỗi",
        "Không thể xử lý từ chối yêu cầu. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const submitApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      await approveRequest(selectedRequest.id, approveReason);
      if (selectStatus === "") {
        await fetchRequests();
      } else {
        await fetchSearchRequest();
      }
      setShowPopupApprove(false);
      setApproveReason("");
      Swal.fire({
        title: "Phê duyệt thành công",
        text: "Yêu cầu đã được xử lý và phê duyệt thành công.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Lỗi khi phê duyệt yêu cầu:", error);
      Swal.fire(
        "Lỗi",
        "Không thể phê duyệt yêu cầu. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

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
      render: (text, record) => (
        <Text
          strong
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/event-detail-EOG/${record.eventId}`)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusText(status),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => reason || "Không có",
    },
    {
      title: "Từ",
      dataIndex: "eventStartTime",
      key: "eventStartTime",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Đến",
      dataIndex: "eventEndTime",
      key: "eventEndTime",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === 1 ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              type="primary"
              onClick={() => handleApprove(record)}
              style
              hadron={{ backgroundColor: "green", borderColor: "green" }}
            >
              Phê duyệt
            </Button>
            <Button type="primary" danger onClick={() => handleReject(record)}>
              Từ chối
            </Button>
          </div>
        ) : null,
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      className="manage-request-page"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Header />
      <div
        className="manage-request-content"
        style={{ marginTop: "100px", padding: "20px" }}
      >
        <h2>Danh sách yêu cầu</h2>
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
          rowClassName="manage-request-row"
          onChange={handleTableChange}
          loading={isLoading}
        />
        {showPopupReject && (
          <div className="popup">
            <div className="popup-content">
              <h3>Từ chối yêu cầu</h3>
              <textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div
                className="btn-request"
                style={{ display: "flex", gap: "10px" }}
              >
                <Button onClick={() => setShowPopupReject(false)}>Hủy</Button>
                <Button type="primary" danger onClick={submitReject}>
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}
        {showPopupApprove && (
          <div className="popup">
            <div className="popup-content">
              <h3 style={{ color: "green" }}>Phê duyệt yêu cầu</h3>
              <textarea
                placeholder="Nhập lý do..."
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
              />
              <div
                className="btn-request"
                style={{ display: "flex", gap: "10px" }}
              >
                <Button onClick={() => setShowPopupApprove(false)}>Hủy</Button>
                <Button
                  type="primary"
                  style={{ backgroundColor: "green", borderColor: "green" }}
                  onClick={submitApprove}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <Footer /> */}
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

export default ManageRequest;
