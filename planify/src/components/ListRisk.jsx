import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Spin,
  Card,
  Typography,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined, // Thêm icon này
} from "@ant-design/icons";
import axios from "axios";
import "../styles/Author/ListRisk.css";

const { Title } = Typography;
const { TextArea } = Input;

function ListRisk({ eventId, data }) {
  const [riskList, setRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // State mới cho modal tạo
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm(); // Form riêng cho việc tạo mới

  // Inicialización de datos desde props o API
  useEffect(() => {
    if (data && data.risks && Array.isArray(data.risks)) {
      console.log("Usando datos de riesgos desde props:", data.risks);
      setRiskList(data.risks);
      setLoading(false);
    } else if (eventId) {
      fetchRisks();
    } else {
      setRiskList([]);
      setLoading(false);
    }
  }, [eventId, data]);

  // Función para obtener datos del servidor
  const fetchRisks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.result) {
        setRiskList(response.data.result.risks || []);
      }
    } catch (error) {
      console.error("Error fetching risks:", error);
      message.error("Không thể tải danh sách rủi ro");
    } finally {
      setLoading(false);
    }
  };

  // Xóa rủi ro
  const handleDelete = async (riskId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://localhost:44320/api/Risk/${riskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Đã xóa rủi ro thành công");

      // Tải lại danh sách rủi ro
      fetchRisks();
    } catch (error) {
      console.error("Error deleting risk:", error);
      message.error("Không thể xóa rủi ro");
    }
  };

  // Hiển thị modal cập nhật
  const showUpdateModal = (risk) => {
    setSelectedRisk(risk);
    form.setFieldsValue({
      name: risk.name,
      reason: risk.reason,
      solution: risk.solution,
      description: risk.description,
    });
    setIsUpdateModalVisible(true);
  };

  // Hiển thị modal tạo mới
  const showCreateModal = () => {
    createForm.resetFields(); // Reset form khi mở modal
    setIsCreateModalVisible(true);
  };

  // Xử lý cập nhật rủi ro
  const handleUpdate = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://localhost:44320/api/Risk/${selectedRisk.id}`,
        {
          ...values,
          eventId: eventId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Cập nhật rủi ro thành công");
      setIsUpdateModalVisible(false);

      // Tải lại danh sách rủi ro
      fetchRisks();
    } catch (error) {
      console.error("Error updating risk:", error);
      message.error("Không thể cập nhật rủi ro");
    }
  };

  // Hàm xử lý tạo mới rủi ro
  const handleCreate = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://localhost:44320/api/Risk`,
        {
          ...values,
          eventId: eventId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Tạo mới rủi ro thành công");
      setIsCreateModalVisible(false);

      // Tải lại danh sách rủi ro
      fetchRisks();
    } catch (error) {
      console.error("Error creating risk:", error);
      message.error("Không thể tạo mới rủi ro");
    }
  };
  const userId = localStorage.getItem("userId");

  const columns = [
    {
      title: "Tên rủi ro",
      dataIndex: "name",
      key: "name",
      width: "15%",
    },
    {
      title: "Nguyên nhân",
      dataIndex: "reason",
      key: "reason",
      width: "20%",
      ellipsis: true,
    },
    {
      title: "Giải pháp",
      dataIndex: "solution",
      key: "solution",
      width: "20%",
      ellipsis: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "30%",
      ellipsis: true,
    },
  ];
  if (userId === data.createdBy.id && data.status === 0) {
    columns.push({
      title: "Hành động",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showUpdateModal(record)}
            size="small"
            className="edit-button"
          />
          <Popconfirm
            title="Xác nhận xóa rủi ro"
            description="Bạn có chắc chắn muốn xóa rủi ro này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              className="delete-button"
            />
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <div className="risk-management-container">
      <Card className="risk-list-card">
        <div className="risk-header">
          <Title level={3} className="risk-title">
            Danh sách rủi ro
          </Title>
          {userId === data.createdBy.id && data.status === 0 && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCreateModal}
              className="add-risk-button"
            >
              Thêm rủi ro
            </Button>
          )}
        </div>

        <Spin spinning={loading}>
          <Table
            className="risk-table"
            dataSource={riskList}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "Không có rủi ro nào" }}
          />
        </Spin>

        <Modal
          title="Cập nhật rủi ro"
          open={isUpdateModalVisible}
          onCancel={() => setIsUpdateModalVisible(false)}
          footer={null}
          className="risk-update-modal"
        >
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <Form.Item
              name="name"
              label="Tên rủi ro"
              rules={[{ required: true, message: "Vui lòng nhập tên rủi ro" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Nguyên nhân"
              rules={[{ required: true, message: "Vui lòng nhập nguyên nhân" }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="solution"
              label="Giải pháp"
              rules={[{ required: true, message: "Vui lòng nhập giải pháp" }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space className="form-actions" style={{ float: "right" }}>
                <Button onClick={() => setIsUpdateModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo mới rủi ro */}
        <Modal
          title="Thêm rủi ro mới"
          open={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
          className="risk-create-modal"
        >
          <Form form={createForm} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              name="name"
              label="Tên rủi ro"
              rules={[{ required: true, message: "Vui lòng nhập tên rủi ro" }]}
            >
              <Input placeholder="Nhập tên rủi ro" />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Nguyên nhân"
              rules={[{ required: true, message: "Vui lòng nhập nguyên nhân" }]}
            >
              <TextArea rows={3} placeholder="Nhập nguyên nhân" />
            </Form.Item>

            <Form.Item
              name="solution"
              label="Giải pháp"
              rules={[{ required: true, message: "Vui lòng nhập giải pháp" }]}
            >
              <TextArea rows={3} placeholder="Nhập giải pháp" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={4} placeholder="Nhập mô tả (không bắt buộc)" />
            </Form.Item>

            <Form.Item>
              <Space className="form-actions" style={{ float: "right" }}>
                <Button onClick={() => setIsCreateModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Tạo mới
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default ListRisk;
