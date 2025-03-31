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
  DatePicker,
  InputNumber,
  Empty,
  Tooltip,
  Drawer,
  List,
  Checkbox,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "../styles/Tasks/ListTask.css";
import { createTaskAPI, updateTask, deleteTask } from "../services/taskService";
import axios from "axios";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;

function ListTask({ eventId, data }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubTaskModalVisible, setIsSubTaskModalVisible] = useState(false);
  const [subTaskForm] = Form.useForm();
  const [isSubTaskSubmitting, setIsSubTaskSubmitting] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subTasksVisible, setSubTasksVisible] = useState(false);
  const [subTasks, setSubTasks] = useState([]);
  const [loadingSubTasks, setLoadingSubTasks] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (data && data.tasks && Array.isArray(data.tasks)) {
      console.log("Using tasks data from props:", data.tasks);
      setTasks(data.tasks);
      setLoading(false);
    } else if (eventId) {
      fetchTasksFromAPI();
    } else {
      setLoading(false);
      setTasks([]);
    }
  }, [eventId, data]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const activeTasksOnly = tasks.filter((task) => task.status !== 0);
      setFilteredTasks(activeTasksOnly);
      setPagination((prev) => ({
        ...prev,
        total: activeTasksOnly.length,
      }));
    } else {
      setFilteredTasks([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    }
  }, [tasks]);

  useEffect(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    setDisplayedTasks(paginatedTasks);
  }, [filteredTasks, pagination.current, pagination.pageSize]);

  const fetchTasksFromAPI = async () => {
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
        const tasksData = response.data.result.tasks || [];
        setTasks(tasksData);
        if (!loading) {
          message.success("Đã tải lại danh sách công việc thành công");
        }
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error("Không thể tải danh sách công việc");
      setError("Không thể tải danh sách công việc");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  const fetchTasks = () => {
    fetchTasksFromAPI();
  };
  const createSubTask = async (values) => {
    try {
      setIsSubTaskSubmitting(true);

      const token = localStorage.getItem("token");
      const newSubTaskData = {
        subTaskName: values.subTaskName,
        subTaskDescription: values.subTaskDescription,
        startTime: values.startTime
          ? values.startTime.format("YYYY-MM-DD")
          : null,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        amountBudget: parseFloat(values.amountBudget) || 0,
        taskId: selectedTask.id,
      };

      await axios.post(
        "https://localhost:44320/api/SubTasks/create",
        newSubTaskData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Tạo công việc con thành công");
      subTaskForm.resetFields();
      setIsSubTaskModalVisible(false);
      fetchTasksFromAPI().then(() => {
        const updatedTask = tasks.find((task) => task.id === selectedTask.id);
        if (updatedTask) {
          showSubTasks(updatedTask);
        }
      });

      return true;
    } catch (error) {
      console.error("Error creating subtask:", error);
      message.error("Không thể tạo công việc con");
      return false;
    } finally {
      setIsSubTaskSubmitting(false);
    }
  };

  const showCreateSubTaskModal = () => {
    subTaskForm.resetFields();
    setIsSubTaskModalVisible(true);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const showCreateModal = () => {
    form.resetFields();
    setIsEditMode(false);
    setSelectedTask(null);
    setIsTaskModalVisible(true);
  };

  const showEditModal = (task) => {
    setSelectedTask(task);
    setIsEditMode(true);
    form.setFieldsValue({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      startTime: task.startTime ? moment(task.startTime) : null,
      deadline: task.deadline ? moment(task.deadline) : null,
      amountBudget: task.amountBudget,
    });
    setIsTaskModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalVisible(false);
  };

  const createTask = async (values) => {
    try {
      setIsSubmitting(true);
      setReloading(true);

      const newTaskData = {
        taskName: values.taskName,
        taskDescription: values.taskDescription,
        startTime: values.startTime
          ? values.startTime.format("YYYY-MM-DD")
          : null,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        amountBudget: parseFloat(values.amountBudget) || 0,
        eventId: eventId,
        status: 1,
      };

      await createTaskAPI(newTaskData);
      message.success("Tạo công việc mới thành công");
      handleCloseModal();

      fetchTasksFromAPI();
      return true;
    } catch (error) {
      console.error("Error creating task:", error);
      message.error("Không thể tạo công việc mới");
      setReloading(false);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTaskData = async (values) => {
    try {
      setIsSubmitting(true);
      setReloading(true);

      const updatedTaskData = {
        taskName: values.taskName,
        taskDescription: values.taskDescription,
        startTime: values.startTime
          ? values.startTime.format("YYYY-MM-DD")
          : null,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        amountBudget: parseFloat(values.amountBudget) || 0,
        eventId: eventId,
        status: 1,
      };

      await updateTask(selectedTask.id, updatedTaskData);
      message.success("Cập nhật công việc thành công");
      handleCloseModal();

      fetchTasksFromAPI();
      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      message.error("Không thể cập nhật công việc");
      setReloading(false);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (taskId) => {
    try {
      setReloading(true);

      await deleteTask(taskId, -1);
      message.success("Đã xóa công việc thành công");

      fetchTasksFromAPI();
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Không thể xóa công việc");
      setReloading(false);
      return false;
    }
  };

  const handleSubmit = (values) => {
    if (isEditMode) {
      updateTaskData(values);
    } else {
      createTask(values);
    }
  };

  const showSubTasks = (task) => {
    setSelectedTask(task);
    setLoadingSubTasks(true);
    setSubTasksVisible(true);

    if (task.subTasks && Array.isArray(task.subTasks)) {
      console.log("SubTasks original:", task.subTasks);

      const processedSubTasks = task.subTasks.map((subTask) => {
        console.log("Original subtask:", subTask);
        return {
          ...subTask,
          status:
            typeof subTask.status === "number"
              ? subTask.status
              : subTask.status === true
              ? 1
              : subTask.completed === true
              ? 1
              : 0,
        };
      });

      console.log("Processed subtasks:", processedSubTasks);
      setSubTasks(processedSubTasks);
    } else {
      setSubTasks([]);
    }

    setLoadingSubTasks(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("DD/MM/YYYY");
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
  };
  const toggleSubTaskStatus = async (subTaskId, completed) => {
    try {
      const token = localStorage.getItem("token");
      const status = completed ? 1 : 0;

      await axios.put(
        `https://localhost:44320/api/SubTasks/update-status/${subTaskId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubTasks((prev) =>
        prev.map((item) =>
          item.id === subTaskId ? { ...item, status: status } : item
        )
      );

      message.success("Cập nhật trạng thái thành công");

      await fetchTasksFromAPI();

      if (selectedTask) {
        const updatedTask = tasks.find((task) => task.id === selectedTask.id);
        if (updatedTask) {
          showSubTasks(updatedTask);
        }
      }
    } catch (error) {
      console.error("Error updating subtask status:", error);
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const deleteSubTask = async (subTaskId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `https://localhost:44320/api/SubTasks/update-status/${subTaskId}`,
        { status: -1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubTasks((prev) => prev.filter((item) => item.id !== subTaskId));

      message.success("Đã xóa công việc con thành công");

      fetchTasksFromAPI();
    } catch (error) {
      console.error("Error deleting subtask:", error);
      message.error("Không thể xóa công việc con");
    }
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
      title: "Tiêu đề",
      dataIndex: "taskName",
      key: "taskName",
      width: "15%",
      render: (text, record) => (
        <div>
          {text}
          {record.subTasks && record.subTasks.length > 0 && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {record.subTasks.length} công việc con
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "taskDescription",
      key: "taskDescription",
      width: "25%",
      ellipsis: true,
      render: (text) => text || "Chưa có mô tả",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      width: "12%",
      render: (text) => formatDate(text),
    },
    {
      title: "Hạn chót",
      dataIndex: "deadline",
      key: "deadline",
      width: "12%",
      render: (text, record) => {
        const isOverdue = text && new Date(text) < new Date();
        return (
          <span style={{ color: isOverdue ? "#ff4d4f" : "inherit" }}>
            {formatDate(text)}
          </span>
        );
      },
    },
    {
      title: "Ngân sách",
      dataIndex: "amountBudget",
      key: "amountBudget",
      width: "13%",
      render: (text) => formatCurrency(text),
    },
    {
      title: "Hành động",
      key: "action",
      width: "18%",
      render: (_, record) => (
        <Space size="small" onClick={handleActionClick}>
          <Tooltip title="Xem danh sách công việc con">
            <Button
              icon={<UnorderedListOutlined />}
              onClick={() => showSubTasks(record)}
              size="small"
              className="details-button"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
            className="edit-button"
          />
          <Popconfirm
            title="Xác nhận xóa công việc"
            description="Bạn có chắc chắn muốn xóa công việc này?"
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
    },
  ];

  if (loading && !reloading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: "15px" }}>Đang tải danh sách công việc...</div>
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
          onClick={fetchTasksFromAPI}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  const calculateProgress = (subTasks) => {
    if (!subTasks || subTasks.length === 0) return 0;

    const completedCount = subTasks.filter((task) => {
      return (
        task.status === 1 || task.status === true || task.completed === true
      );
    }).length;

    return Math.round((completedCount / subTasks.length) * 100);
  };

  return (
    <div className="task-management-container">
      <Card className="task-list-card">
        <div className="task-header">
          <Title level={3} className="task-title">
            Danh sách công việc ({filteredTasks.length})
          </Title>

          <div className="task-actions">
            <Space>
              {/* Reload button */}
              <Tooltip title="Làm mới dữ liệu">
                <Button
                  icon={<ReloadOutlined spin={reloading} />}
                  onClick={fetchTasksFromAPI}
                  loading={reloading}
                >
                  Làm mới
                </Button>
              </Tooltip>

              {/* Create task button */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
                className="add-task-button"
              >
                Tạo công việc
              </Button>
            </Space>
          </div>
        </div>

        <Spin spinning={reloading} tip="Đang tải dữ liệu...">
          {displayedTasks.length === 0 ? (
            <Empty
              image="https://cdn-icons-png.flaticon.com/512/7486/7486754.png"
              imageStyle={{ height: 120 }}
              description="Chưa có công việc nào"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
              >
                Tạo công việc đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table
              className="task-table"
              dataSource={displayedTasks}
              columns={columns}
              rowKey="id"
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong ${total} công việc`,
                pageSizeOptions: ["10", "20", "50"],
                hideOnSinglePage: displayedTasks.length <= 10,
              }}
              onChange={handleTableChange}
              locale={{
                emptyText: "Không có công việc nào",
              }}
              rowClassName={(record) =>
                record.deadline && new Date(record.deadline) < new Date()
                  ? "overdue-row"
                  : ""
              }
              onRow={(record) => ({
                onClick: () => showSubTasks(record),
                style: { cursor: "pointer" },
              })}
            />
          )}
        </Spin>

        {/* Task create/edit modal */}
        <Modal
          title={isEditMode ? "Cập nhật công việc" : "Tạo công việc mới"}
          open={isTaskModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          className="task-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              taskName: "",
              taskDescription: "",
              startTime: null,
              deadline: null,
              amountBudget: 0,
            }}
          >
            <Form.Item
              name="taskName"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề công việc" />
            </Form.Item>

            <Form.Item name="taskDescription" label="Mô tả">
              <TextArea rows={3} placeholder="Nhập mô tả công việc" />
            </Form.Item>

            <Form.Item
              name="startTime"
              label={
                <Space>
                  <CalendarOutlined /> Ngày bắt đầu
                </Space>
              }
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày bắt đầu"
              />
            </Form.Item>

            <Form.Item
              name="deadline"
              label={
                <Space>
                  <ClockCircleOutlined /> Hạn chót
                </Space>
              }
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue("startTime")) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(getFieldValue("startTime"))) {
                      return Promise.reject(
                        new Error("Hạn chót phải sau ngày bắt đầu!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn hạn chót"
              />
            </Form.Item>

            <Form.Item name="amountBudget" label="Ngân sách (VND)">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Nhập ngân sách"
              />
            </Form.Item>

            <Form.Item>
              <Space className="form-actions" style={{ float: "right" }}>
                <Button onClick={handleCloseModal}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Drawer for sub-tasks */}
        <Drawer
          title={
            <div>
              <div className="task-drawer-title">
                <span>Chi tiết công việc: {selectedTask?.taskName}</span>
                <Tag color="blue">
                  Hoàn thành: {calculateProgress(selectedTask?.subTasks)}%
                </Tag>
              </div>
              <div className="task-detail-info">
                <div>
                  <span className="detail-label">Bắt đầu:</span>{" "}
                  {formatDate(selectedTask?.startTime)}
                </div>
                <div>
                  <span className="detail-label">Hạn chót:</span>{" "}
                  {formatDate(selectedTask?.deadline)}
                </div>
                {selectedTask?.amountBudget > 0 && (
                  <div>
                    <span className="detail-label">Ngân sách:</span>{" "}
                    {formatCurrency(selectedTask?.amountBudget)}
                  </div>
                )}
              </div>
              {selectedTask?.taskDescription && (
                <div className="task-description">
                  <span className="detail-label">Mô tả:</span>{" "}
                  {selectedTask.taskDescription}
                </div>
              )}
            </div>
          }
          placement="right"
          width={500}
          onClose={() => setSubTasksVisible(false)}
          open={subTasksVisible}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCreateSubTaskModal}
            >
              Thêm mới
            </Button>
          }
        >
          <Modal
            title="Thêm công việc con mới"
            open={isSubTaskModalVisible}
            onCancel={() => setIsSubTaskModalVisible(false)}
            footer={null}
            className="subtask-modal"
          >
            <Form
              form={subTaskForm}
              layout="vertical"
              onFinish={createSubTask}
              initialValues={{
                subTaskName: "",
                subTaskDescription: "",
                startTime: null,
                deadline: null,
                amountBudget: 0,
              }}
            >
              <Form.Item
                name="subTaskName"
                label="Tiêu đề"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tiêu đề công việc con!",
                  },
                ]}
              >
                <Input placeholder="Nhập tiêu đề công việc con" />
              </Form.Item>

              <Form.Item name="subTaskDescription" label="Mô tả">
                <TextArea rows={2} placeholder="Nhập mô tả công việc con" />
              </Form.Item>

              <Form.Item
                name="startTime"
                label={
                  <Space>
                    <CalendarOutlined /> Ngày bắt đầu
                  </Space>
                }
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>

              <Form.Item
                name="deadline"
                label={
                  <Space>
                    <ClockCircleOutlined /> Hạn chót
                  </Space>
                }
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue("startTime")) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(getFieldValue("startTime"))) {
                        return Promise.reject(
                          new Error("Hạn chót phải sau ngày bắt đầu!")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn hạn chót"
                />
              </Form.Item>

              <Form.Item name="amountBudget" label="Ngân sách (VND)">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Nhập ngân sách"
                />
              </Form.Item>

              <Form.Item>
                <Space className="form-actions" style={{ float: "right" }}>
                  <Button onClick={() => setIsSubTaskModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubTaskSubmitting}
                  >
                    Tạo mới
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          <div className="sub-tasks-section">
            <Title level={5}>Danh sách công việc con ({subTasks.length})</Title>

            <Spin spinning={loadingSubTasks}>
              {!subTasks || subTasks.length === 0 ? (
                <Empty
                  description="Chưa có công việc con nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  className="sub-task-list"
                  itemLayout="horizontal"
                  dataSource={subTasks}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          size="small"
                          onClick={() => {
                            message.info("Chức năng đang phát triển");
                          }}
                        />,
                        <Popconfirm
                          title="Xác nhận xóa"
                          description="Bạn có chắc chắn muốn xóa công việc con này?"
                          onConfirm={() => deleteSubTask(item.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                          icon={
                            <ExclamationCircleOutlined
                              style={{ color: "red" }}
                            />
                          }
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <div className="sub-task-item">
                        <Checkbox
                          checked={item.status === 1}
                          onChange={(e) =>
                            toggleSubTaskStatus(item.id, e.target.checked)
                          }
                        />

                        <div
                          className={`sub-task-content ${
                            item.status === 1 ? "completed" : ""
                          }`}
                        >
                          <div className="sub-task-title">
                            {item.subTaskName}
                          </div>
                          {item.deadline && (
                            <div className="sub-task-date">
                              Hạn: {formatDate(item.deadline)}
                            </div>
                          )}
                          {item.subTaskDescription && (
                            <div className="sub-task-description">
                              {item.subTaskDescription}
                            </div>
                          )}
                        </div>
                        {item.priority && (
                          <Tag
                            color={
                              item.priority === "high"
                                ? "red"
                                : item.priority === "medium"
                                ? "orange"
                                : "green"
                            }
                          >
                            {item.priority === "high"
                              ? "Cao"
                              : item.priority === "medium"
                              ? "Trung bình"
                              : "Thấp"}
                          </Tag>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </div>
        </Drawer>
      </Card>
    </div>
  );
}

export default ListTask;
