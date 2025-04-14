import React, { useState, useEffect } from "react";
import { Table, Spin, Empty, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/Events/HistoryEvent.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

const EventHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchEventHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://localhost:44320/api/JoinProject/view-attended-events-history?page=${currentPage}&pageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.items) {
        setEvents(response.data.items);
        setTotalEvents(response.data.total || response.data.items.length);
        console.log("Hehehe: ", response.data.items);
      } else {
        setEvents([]);
        setTotalEvents(0);
      }
    } catch (error) {
      console.error("Error fetching event history:", error);
      message.error("Không thể tải lịch sử sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (eventId) => {
    navigate(`/event-detail-spec/${eventId}`, {
      state: { from: "history-event" },
    });
  };

  useEffect(() => {
    fetchEventHistory();
  }, [currentPage]);

  const columns = [
    {
      title: "Tiêu đề sự kiện",
      dataIndex: "eventTitle",
      key: "eventTitle",
      render: (text, record) => (
        <a
          className="event-title-link"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/event-detail-spec/${record.eventId}`, {
              state: { from: "history-event" },
            });
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (text) =>
        new Date(text).toLocaleString("vi-VN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          // hour12: true,
        }),
    },
    {
      title: "Địa điểm",
      dataIndex: "placed",
      key: "placed",
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "category",
      render: (categoryName) =>
        categoryName ? categoryName : "Không có danh mục",
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div
        className="event-history-container"
        style={{ padding: "20px", marginTop: "100px" }}
      >
        <h2 style={{ marginBottom: "20px" }}>Lịch Sử Sự Kiện</h2>

        {events.length === 0 ? (
          <Empty description="Bạn chưa tham gia sự kiện nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={events}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalEvents,
              onChange: (page) => setCurrentPage(page),
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record.eventId),
              style: { cursor: "pointer" },
            })}
          />
        )}
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default EventHistory;
