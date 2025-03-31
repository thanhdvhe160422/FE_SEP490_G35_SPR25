import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Spin,
  Card,
  Typography,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "../styles/Author/ListCost.css";

const { Title } = Typography;

function ListCost({ eventId, data }) {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCost, setSelectedCost] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Khởi tạo dữ liệu từ props hoặc API
  useEffect(() => {
    if (data && data.costs && Array.isArray(data.costs)) {
      console.log("Using costs data from props:", data.costs);
      setCosts(data.costs);
      setPagination((prev) => ({
        ...prev,
        total: data.costs.length,
      }));
      setLoading(false);
    } else if (eventId) {
      fetchCostsFromAPI();
    } else {
      setCosts([]);
      setLoading(false);
    }
  }, [eventId, data]);

  const fetchCostsFromAPI = async () => {
    setLoading(true);
    setReloading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.result) {
        // Kiểm tra xem dữ liệu có costs hay costBreakdowns
        const costsData = response.data.result.costBreakdowns || [];
        setCosts(costsData);
        setPagination((prev) => ({
          ...prev,
          total: costsData.length,
        }));
      } else {
        setCosts([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
        }));
      }
      message.success("Đã tải lại dữ liệu thành công");
    } catch (error) {
      console.error("Error fetching costs:", error);
      message.error("Không thể tải danh sách chi phí");
      setError("Không thể tải danh sách chi phí");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  const fetchCosts = () => {
    fetchCostsFromAPI();
  };

  const handleDelete = async (costId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://localhost:44320/api/Cost/${costId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Đã xóa chi phí thành công");

      const startIndex = (pagination.current - 1) * pagination.pageSize;
      const currentPageCosts = costs.slice(
        startIndex,
        startIndex + pagination.pageSize
      );

      if (currentPageCosts.length === 1 && pagination.current > 1) {
        setPagination((prev) => ({
          ...prev,
          current: prev.current - 1,
        }));
      }

      fetchCostsFromAPI();
    } catch (error) {
      console.error("Error deleting cost:", error);
      message.error("Không thể xóa chi phí");
    }
  };

  const showCreateModal = () => {
    form.resetFields();
    setIsEditMode(false);
    setSelectedCost(null);
    setIsModalVisible(true);
  };

  const showUpdateModal = (cost) => {
    setSelectedCost(cost);
    form.setFieldsValue({
      name: cost.name,
      quantity: cost.quantity,
      priceByOne: cost.priceByOne,
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const createCost = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const newCostData = {
        name: values.name,
        quantity: values.quantity,
        priceByOne: values.priceByOne,
        eventId: eventId,
      };

      await axios.post(`https://localhost:44320/api/Cost`, newCostData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Tạo chi phí mới thành công");
      handleCloseModal();

      fetchCostsFromAPI();
    } catch (error) {
      console.error("Error creating cost:", error);
      message.error("Không thể tạo chi phí mới");
    }
  };

  const updateCost = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const updatedCostData = {
        name: values.name,
        quantity: values.quantity,
        priceByOne: values.priceByOne,
        eventId: eventId,
      };

      await axios.put(
        `https://localhost:44320/api/Cost/${selectedCost.id}`,
        updatedCostData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Cập nhật chi phí thành công");
      handleCloseModal();

      fetchCostsFromAPI();
    } catch (error) {
      console.error("Error updating cost:", error);
      message.error("Không thể cập nhật chi phí");
    }
  };

  const handleSubmit = (values) => {
    if (isEditMode) {
      updateCost(values);
    } else {
      createCost(values);
    }
  };

  const calculateTotalPrice = (quantity, priceByOne) => {
    return quantity * priceByOne;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleManualReload = () => {
    fetchCostsFromAPI();
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: "5%",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên chi phí",
      dataIndex: "name",
      key: "name",
      width: "25%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: "15%",
      render: (text) => text || 0,
    },
    {
      title: "Đơn giá",
      dataIndex: "priceByOne",
      key: "priceByOne",
      width: "20%",
      render: (text) => formatCurrency(text),
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      width: "20%",
      render: (_, record) =>
        formatCurrency(calculateTotalPrice(record.quantity, record.priceByOne)),
    },
    {
      title: "Hành động",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Cập nhật">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showUpdateModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa chi phí"
            description="Bạn có chắc chắn muốn xóa chi phí này?"
            onConfirm={() => handleDelete(record.id)}
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

  if (loading && !reloading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: "15px" }}>Đang tải danh sách chi phí...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "30px" }}>
        <Title level={4} style={{ color: "#ff4d4f" }}>
          {error}
        </Title>
        <Button
          type="primary"
          icon={<SyncOutlined />}
          onClick={fetchCostsFromAPI}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="cost-management-container">
      <Card className="cost-list-card">
        <div className="cost-header">
          <Title level={3}>Danh sách chi phí ({costs.length})</Title>

          <Space>
            {/* Nút reload thủ công */}
            <Tooltip title="Tải lại dữ liệu">
              <Button
                icon={<ReloadOutlined spin={reloading} />}
                onClick={handleManualReload}
                loading={reloading}
              >
                Làm mới
              </Button>
            </Tooltip>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCreateModal}
            >
              Thêm chi phí
            </Button>
          </Space>
        </div>

        <Spin spinning={reloading}>
          <Table
            dataSource={costs}
            columns={columns}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng cộng ${total} chi phí`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            onChange={handleTableChange}
            locale={{ emptyText: "Không có chi phí nào" }}
            summary={(pageData) => {
              const totalAmount = pageData.reduce(
                (total, item) =>
                  total + calculateTotalPrice(item.quantity, item.priceByOne),
                0
              );

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell
                    index={0}
                    colSpan={4}
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Tổng cộng:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <span style={{ fontWeight: "bold" }}>
                      {formatCurrency(totalAmount)}
                    </span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              );
            }}
          />
        </Spin>

        <Modal
          title={isEditMode ? "Cập nhật chi phí" : "Thêm chi phí mới"}
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ name: "", quantity: 1, priceByOne: 0 }}
          >
            <Form.Item
              name="name"
              label="Tên chi phí"
              rules={[
                { required: true, message: "Vui lòng nhập tên chi phí!" },
              ]}
            >
              <Input placeholder="Nhập tên chi phí" />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập số lượng"
              />
            </Form.Item>

            <Form.Item
              name="priceByOne"
              label="Đơn giá (VND)"
              rules={[{ required: true, message: "Vui lòng nhập đơn giá!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập đơn giá"
                min={0}
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ float: "right" }}>
                <Button onClick={handleCloseModal}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  {isEditMode ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default ListCost;
