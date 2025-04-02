import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Input,
  Modal,
  Spin,
  Space,
  message,
  Pagination,
  Avatar,
  Tooltip,
  Card,
  Typography,
  Popconfirm,
} from "antd";
import {
  ExclamationCircleOutlined,
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import refreshAccessToken from "../services/refreshToken";
import "../styles/Author/ListUser.css";

const { Title } = Typography;

export const searchUsers = async (searchTerm) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://localhost:44320/api/Users/search?input=${searchTerm}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.get(
            `https://localhost:44320/api/Users/search?input=${searchTerm}`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }
    console.error("Error searching users:", error);
    return { error: error.message };
  }
};

export const addUserToEvent = async (eventId, userIds) => {
  let token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `https://localhost:44320/api/JoinProject/add-implementers`,
      {
        eventId: eventId,
        UserIds: userIds,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        localStorage.setItem("token", newToken);
        try {
          const retryResponse = await axios.post(
            `https://localhost:44320/api/JoinProject/add-implementers`,
            {
              eventId: eventId,
              UserIds: userIds,
            },
            {
              headers: { Authorization: `Bearer ${newToken}` },
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          return { error: "unauthorized" };
        }
      } else {
        localStorage.removeItem("token");
        return { error: "expired" };
      }
    }
    console.error("Error adding user to event:", error);
    return { error: error.message };
  }
};

const ListMember = ({ eventId, data }) => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetched participants:", response.data);
      if (response.data) {
        setParticipants(response.data.result.joinProjects || []);
        setTotalCount(response.data.result.joinProjects?.length || 0);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }
      message.error("Không thể tải danh sách người tham gia");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [eventId, navigate]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      message.info("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(searchTerm);
      if (results.error) {
        if (results.error === "expired") {
          message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
          navigate("/login");
          return;
        }
        message.error("Không thể thực hiện tìm kiếm");
      } else {
        const filteredResults = results.filter(
          (user) => !participants.some((p) => p.userId === user.id)
        );
        setSearchResults(filteredResults || []);
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tìm kiếm");
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddUser = async (userId) => {
    try {
      setLoading(true);
      const response = await addUserToEvent(eventId, [userId]);
      console.log("Event Id: ", eventId);

      if (response.error) {
        if (response.error === "expired") {
          message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
          navigate("/login");
          return;
        }
        message.error("Không thể thêm người dùng vào sự kiện");
      } else {
        message.success("Đã thêm người dùng vào sự kiện thành công");
        setRefreshKey((prevKey) => prevKey + 1);
        setSearchResults(searchResults.filter((user) => user.id !== userId));
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi thêm người dùng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `https://localhost:44320/api/JoinProject/delete-from-project/${eventId}/${userId}`;

      console.log("Calling API:", url);

      const response = await axios({
        method: "put",
        url: url,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API response:", response.data);
      console.log("API response status:", response.status);

      if (response.status === 200) {
        message.success("Đã xóa người dùng khỏi sự kiện thành công");

        setRefreshKey((prevKey) => prevKey + 1);
      } else {
        message.error("Đã xảy ra lỗi khi xóa người dùng");
      }
    } catch (error) {
      console.error("Error details:", error);
      if (error.response) {
        console.error("API error response:", error.response.data);
      }
      message.error("Đã xảy ra lỗi khi xóa người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  useEffect(() => {
    if (eventId) {
      fetchParticipants();
    }
  }, [eventId, fetchParticipants, refreshKey]);

  useEffect(() => {
    if (data?.joinProjects?.length && !refreshKey) {
      console.log("Using data from props:", data.joinProjects);
      setParticipants(data.joinProjects);
      setTotalCount(data.joinProjects.length);
    }
  }, [data, refreshKey]);

  const participantColumns = [
    {
      title: "Họ tên",
      dataIndex: "userFullName",
      key: "userFullName",
      render: (text, record) => (
        <span>
          {text || `${record.firstName || ""} ${record.lastName || ""}`}
        </span>
      ),
    },
    {
      title: "Thời gian tham gia",
      dataIndex: "timeJoinProject",
      key: "timeJoinProject",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Xác nhận xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này khỏi sự kiện?"
            onConfirm={() => handleRemoveUser(record.userId)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const searchResultColumns = [
    {
      title: "Ảnh đại diện",
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      render: (text, record) => (
        <Avatar src={text || "https://via.placeholder.com/40"} />
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <span>
          {text || `${record.firstName || ""} ${record.lastName || ""}`}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Thêm vào sự kiện">
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => handleAddUser(record.id)}
            size="small"
            className="add-btn"
          />
        </Tooltip>
      ),
    },
  ];

  // Modal afterClose callback để cập nhật lại dữ liệu khi đóng modal
  const handleModalAfterClose = () => {
    // Nếu đã có thay đổi (refreshKey > 0), fetch lại danh sách
    if (refreshKey > 0) {
      fetchParticipants();
    }
  };

  return (
    <div className="event-participants-container">
      <Card className="event-participants-card">
        <div className="event-participants-header">
          <Title level={3} className="event-participants-title">
            <TeamOutlined /> Quản lý người tham gia sự kiện
          </Title>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsSearchModalVisible(true)}
            className="add-participant-btn"
          >
            Thêm người tham gia
          </Button>
        </div>

        <div className="participants-table-container">
          <Spin spinning={loading}>
            <Table
              className="participants-table"
              dataSource={participants}
              columns={participantColumns}
              rowKey={(record, index) => index.toString()}
              pagination={false}
              locale={{ emptyText: "Không có người tham gia nào" }}
            />
            {totalCount > 0 && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalCount}
                  showSizeChanger
                  onChange={handlePageChange}
                  showTotal={(total) => `Tổng số: ${total} người tham gia`}
                />
              </div>
            )}
          </Spin>
        </div>
      </Card>

      <Modal
        title="Tìm kiếm người dùng"
        open={isSearchModalVisible}
        onCancel={() => {
          setIsSearchModalVisible(false);
          setSearchTerm("");
          setSearchResults([]);
        }}
        afterClose={handleModalAfterClose}
        footer={null}
        width={800}
        className="search-user-modal"
      >
        <div className="search-input-container">
          <Input.Search
            placeholder="Nhập tên hoặc email người dùng"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            enterButton
            loading={searchLoading}
          />
        </div>

        <Spin spinning={searchLoading}>
          <Table
            className="search-results-table"
            dataSource={searchResults}
            columns={searchResultColumns}
            rowKey={(record, index) => index.toString()}
            pagination={false}
            locale={{
              emptyText: searchTerm
                ? "Không tìm thấy người dùng"
                : "Nhập từ khóa để tìm kiếm",
            }}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default ListMember;
